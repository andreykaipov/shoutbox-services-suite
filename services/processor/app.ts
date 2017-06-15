import config from '../../utils/config'
const logger = config.Logger('SHOUTS_PROCESSOR_APP')

import * as amqp from 'amqplib'
import { rabbitChannel } from '../../utils/rabbit';
import { processRawShout } from "./shouts-processor";

~async function startProcessing() {

  const channel = await rabbitChannel()
  
  const consumer = await channel.consume(config.RABBIT.PROCESSOR.INBOUND_QUEUE, msg => {
    const rawShout = msg.content.toString()
    const processedShout = processRawShout(rawShout)
    const buffer = new Buffer(JSON.stringify(processedShout))
    logger.info('consumed', processedShout)
    channel.publish(config.RABBIT.PROCESSOR.OUTBOUND_EXCHANGE, 'processed.shout', buffer, { contentType: 'application/json'})
    channel.ack(msg)
  }, { noAck: false })

}()
