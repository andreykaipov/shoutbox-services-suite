import config from '../../utils/config'
const log = config.Logger('API_APP')

import * as cors from 'cors'
import * as express from 'express'
import { Mongo } from 'mongodb-pool'
import { Rabbit } from '../../utils/rabbit'
import { ShoutsController } from './controllers/shouts'
import { UsersController } from './controllers/users'
import { streamShoutEvents } from './utils/sse'

const app = express()

async function startApi() {

  app.listen(process.env.SSS_API_PORT, async () => {
    await Mongo.connect(process.env.SSS_MONGO_CS, { poolSize: 5 })
    await Rabbit.connect(process.env.SSS_RABBIT_CS)
    streamShoutEvents()

    app.use(cors({
      origin: '*',
      methods: 'GET'
    }))

    app.use(new ShoutsController().routes())
    app.use(new UsersController().routes())

    app.get('*', (req, res) => {
      res.status(404).send(`<code>what're you looking for?</code>`)
      log.verbose('GET', req.url)
    })
  })

}

~async function start() {
  log.info('Starting API service...')
  startApi().catch(e => {
    log.error(`Caught unexpected error in API service. Restarting...`, e)
    setTimeout(start, 1000)
  })
}()
