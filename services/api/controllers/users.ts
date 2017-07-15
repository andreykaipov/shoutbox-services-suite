import config from '../../../utils/config'
const log = config.Logger('USERS_CONTROLLER')

import * as express from 'express'
import { Collection, Db } from 'mongodb'
import { Mongo } from 'mongodb-pool'
import { versionDelegate, VersionedRequest } from '../middleware/version-delegate'

export class UsersController {

  constructor(
    private router = express.Router(),
    private users_v1 = Mongo.getCollection('users'),
    private users_v2 = Mongo.getCollection('users_v2')
  ) { }

  routes() {
    ['/v1', '/v2', ''].forEach(vn => {
      this.router.get(`/api${vn}/users`, versionDelegate, (req, res) => this.getUsers(req, res))
      this.router.get(`/api${vn}/users/:id`, versionDelegate, (req, res) => this.getOneUser(req, res))
    })
    return this.router
  }

  async getUsers(req: express.Request, res: express.Response) {

    log.verbose('GET', req.url)

    const sort = req.query.sort || '_id:1'
    const sortQuery = {} as any
    if (sort) {
      sort.split(',').map(cond => cond.split(':')).forEach(tuple => {
        sortQuery[tuple[0]] = Number(tuple[1])
      })
    }

    const limit = Number(req.query.limit) || 100
    const offset = Number(req.query.offset) || 0

    const meta = { sort, limit, offset }

    try {
      const users = (req as VersionedRequest).version === 'v1' ? this.users_v1
                                                               : this.users_v2
      const items = await users.aggregate([
        { $sort: sortQuery },
        { $skip: offset },
        { $limit: limit }
      ]).toArray()
      const size = await users.count({})
      const response: any = { _meta: meta }
      response.size = size
      response.items = items
      res.status(200).json(response)
    } catch (e) {
      log.error(e)
      res.status(500).json(e.errmsg)
    }

  }

  async getOneUser(req: express.Request, res: express.Response) {

    log.verbose('GET', req.url)

    const id = Number(req.params.id)
    try {
      const users = (req as VersionedRequest).version === 'v1' ? this.users_v1
                                                               : this.users_v2
      const item = await users.findOne({ _id: id })
      res.status(200).json(item)
    } catch (e) {
      res.status(500).json(e.errmsg)
    }

  }

}
