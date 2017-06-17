import config from '../../utils/config'
const log = config.Logger('PROCESSOR_APP')

import * as amqp from 'amqplib'
import { Rabbit } from '../../utils/rabbit'
import { processRawShout } from './shouts-processor'

log.info('Started processor service...')

~async function startProcessing() {

  const channel = await Rabbit.getChannel()

  const consumer = channel.consume(config.RABBIT.PROCESSOR.INBOUND_QUEUE, msg => {

    const rawShout = msg.content.toString()
    const processedShout = processRawShout(rawShout)
    const buffer = new Buffer(JSON.stringify(processedShout))
    channel.publish(
      config.RABBIT.PROCESSOR.OUTBOUND_EXCHANGE,
      'processed.shout',
      buffer
    )
    channel.ack(msg)

  }, { noAck: false })

  consumer.catch(async () => await Rabbit.close())

}()
