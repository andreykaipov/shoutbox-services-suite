import config from '../../../utils/config'
const log = config.Logger('SHOUTS_CONTROLLER')

import * as express from 'express'
import { Collection, Db } from 'mongodb'
import { Mongo } from 'mongodb-pool'
import { versionDelegate, VersionedRequest } from '../middleware/version-delegate'
import { ShoutsChannel } from '../utils/sse'

export class ShoutsController {

  constructor(
    private router = express.Router(),
    private shouts_v1 = Mongo.getCollection('shouts'),
    private shouts_v2 = Mongo.getCollection('shouts_v2')
  ) { }

  routes() {
    // stream route has to be before the /api/shouts/:id route + has no versioning
    this.router.get(`/api/shouts/stream`, versionDelegate, (req, res) => this.getShoutEventStream(req, res))
    ; ['/v1', '/v2', ''].forEach(vn => {
      this.router.get(`/api${vn}/shouts`, versionDelegate, (req, res) => this.getShouts(req, res))
      this.router.get(`/api${vn}/shouts/:id`, versionDelegate, (req, res) => this.getOneShout(req, res))
    })
    return this.router
  }

  async getShouts(req: express.Request, res: express.Response) {

    log.verbose('GET', req.url)

    const author_id = req.query.author_id
    const author_name = req.query.author_name
    const author_color = req.query.author_color
    const content = req.query.content
    const since = req.query.since
    const until = req.query.until

    const matchQuery: any = {}
    if (author_id) { matchQuery.author_id = author_id }
    if (author_name) { matchQuery.author_name = new RegExp(`^${author_name}$`, 'i') }
    if (author_color) { matchQuery.author_color = new RegExp(`^${author_color}$`, 'i') }
    if (content) { matchQuery.content = new RegExp(content, 'i') }
    if (since || until) {
      matchQuery.timestamp = {}
      if (since) { matchQuery.timestamp.$gte = new Date(since) }
      if (until) { matchQuery.timestamp.$lte = new Date(until) }
    }

    const sort = req.query.sort || '_id:1'
    const sortQuery = {} as any
    if (sort) {
      sort.split(',').map(cond => cond.split(':')).forEach(tuple => {
        sortQuery[tuple[0]] = Number(tuple[1])
      })
    }

    const limit = Number(req.query.limit) || 100
    const offset = Number(req.query.offset) || 0

    const meta = { author_id, author_name, author_color, content, since, until, sort, limit, offset }

    try {
      const shouts = (req as VersionedRequest).version === 'v1' ? this.shouts_v1
                                                                : this.shouts_v2
      const items = await shouts.aggregate([
        { $match: matchQuery },
        { $sort: sortQuery },
        { $skip: offset },
        { $limit: limit }
      ]).toArray()
      const size = await shouts.count(matchQuery)
      const response: any = { _meta: meta }
      response.size = size
      response.items = items
      res.status(200).json(response)
    } catch (e) {
      log.error(e)
      res.status(500).json(e.errmsg)
    }

  }

  async getOneShout(req: express.Request, res: express.Response) {

    log.verbose('GET', req.url)

    const id = Number(req.params.id)
    try {
      const shouts = (req as VersionedRequest).version === 'v1' ? this.shouts_v1
                                                                : this.shouts_v2
      const item = await shouts.findOne({ _id: id })
      res.status(200).json(item)
    } catch (e) {
      res.status(500).json(e.errmsg)
    }

  }

  async getShoutEventStream(req: express.Request, res: express.Response) {

    log.verbose('GET', req.url)
    ShoutsChannel.addClient(req, res)
    log.verbose(`SSE shouts channel client count is now ${ShoutsChannel.getConnectionCount()}!`)

  }

}
