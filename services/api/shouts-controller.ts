import config from '../../utils/config'
const log = config.Logger('SHOUTS_CONTROLLER')

import * as express from 'express'
import { Collection, Db } from 'mongodb'
import { Mongo } from 'mongodb-pool'
import { ShoutsChannel } from './sse'

export class ShoutsController {

  constructor(
    private router = express.Router(),
    private shouts = Mongo.getCollection('shouts')
  ) { }

  routes() {
    this.router.get('/api/shouts', (req, res) => this.getShouts(req, res))
    this.router.get('/api/shouts/stream', (req, res) => this.streamEvents(req, res))
    this.router.get('/api/shouts/:id', (req, res) => this.getOneShout(req, res))
    return this.router
  }

  async getShouts(req: express.Request, res: express.Response) {

    log.verbose('GET', req.url)

    const author_id = req.query.author_id
    const author_name = req.query.author_name
    const content = req.query.content
    const since = req.query.since
    const until = req.query.until

    const matchQuery: any = {}
    if (author_id) { matchQuery.author_id = author_id }
    if (author_name) { matchQuery.author_name = author_name }
    if (content) { matchQuery.content = new RegExp(content) }
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

    const meta = { author_id, author_name, content, since, until, sort, limit, offset }

    try {
      const items = await this.shouts.aggregate([
        { $match: matchQuery },
        { $sort: sortQuery },
        { $skip: offset },
        { $limit: limit }
      ]).toArray()
      const size = await this.shouts.count(matchQuery)
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
      const item = await this.shouts.findOne({ _id: id })
      res.status(200).json(item)
    } catch (e) {
      res.status(500).json(e.errmsg)
    }

  }

  async streamEvents(req: express.Request, res: express.Response) {

    log.verbose('GET', req.url)
    ShoutsChannel.addClient(req, res)
    log.verbose(`SSE shouts channel client count is now ${ShoutsChannel.getConnectionCount()}!`)

  }

}
