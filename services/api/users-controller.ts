import config from '../../utils/config'
const log = config.Logger('USERS_CONTROLLER')

import * as express from 'express'
import { Collection, Db } from 'mongodb'
import { Mongo } from 'mongodb-pool'

export class UsersController {

  constructor(
    private router = express.Router(),
    private users = Mongo.getCollection('users')
  ) { }

  routes() {
    this.router.get('/api/users', (req, res) => this.getUsers(req, res))
    this.router.get('/api/users/:id', (req, res) => this.getOneUser(req, res))
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
      const items = await this.users.aggregate([
        { $sort: sortQuery },
        { $skip: offset },
        { $limit: limit }
      ]).toArray()
      const size = await this.users.count({})
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
      const item = await this.users.findOne({ _id: id })
      res.status(200).json(item)
    } catch (e) {
      res.status(500).json(e.errmsg)
    }

  }

}
