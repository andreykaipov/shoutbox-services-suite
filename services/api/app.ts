import config from '../../utils/config'
const log = config.Logger('API_APP')

import * as express from 'express'
import { Mongo } from 'mongodb-pool'
import { Rabbit } from '../../utils/rabbit'
import { ShoutsController } from './shouts-controller'
import { streamEvents } from './sse'
import { UsersController } from './users-controller'

const app = express()

app.listen(process.env.SSS_API_PORT, async () => {

  await Mongo.connect(process.env.SSS_MONGO_CS, { poolSize: 5 })
  await Rabbit.connect(process.env.SSS_RABBIT_CS)
  streamEvents()

  app.use(new ShoutsController().routes())
  app.use(new UsersController().routes())

  app.get('*', (req, res) => {
    res.status(404).send(`<code>what're you looking for?</code>`)
    log.verbose('GET', req.url)
  })

})
