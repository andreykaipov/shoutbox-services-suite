import config from '../../utils/config'
const log = config.Logger('PERSISTOR_APP')

import * as amqp from 'amqplib'
import { Mongo } from 'mongodb-pool'
import { Rabbit } from '../../utils/rabbit'
import { ProcessedShout } from '../processor/processor'
import { Persistor } from './persistor'

log.info('Started persistor service...')

~async function startPersisting() {

  await Mongo.connect(process.env.SSS_MONGO_CS, { poolSize: 2 })
  const persistor = new Persistor()

  await Rabbit.connect(process.env.SSS_RABBIT_CS)
  const channel = await Rabbit.createChannel()

  const consumer = channel.consume(config.RABBIT.PERSISTOR.INBOUND_QUEUE, async msg => {

    const processedShout = JSON.parse(msg.content.toString()) as ProcessedShout
    await persistor.saveShout(processedShout)
    channel.ack(msg)

  }, { noAck: false })

  consumer.catch(async () => await Rabbit.close())

}()
