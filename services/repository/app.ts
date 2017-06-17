import config from '../../utils/config'
const log = config.Logger('REPOSITORY_APP')

import * as amqp from 'amqplib'
import { Rabbit } from '../../utils/rabbit'
import { ProcessedShout } from '../processor/shouts-processor'
import { initMongo } from './shouts-repository'

log.info('Started repository service...')

~async function startPersisting() {

  const channel = await Rabbit.getChannel()
  const mongo = await initMongo()

  const consumer = channel.consume(config.RABBIT.REPOSITORY.INBOUND_QUEUE, msg => {

    const payload = msg.content.toString()
    const processedShout = JSON.parse(payload) as ProcessedShout
    mongo.persistShout(processedShout)
    channel.ack(msg)

  }, { noAck: false })

  consumer.catch(async () => await Rabbit.close())

}()
