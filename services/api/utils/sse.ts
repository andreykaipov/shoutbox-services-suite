import config from '../../../utils/config'
const log = config.Logger('API_SSE')

import SseChannel = require('sse-channel')
import { Message } from 'amqplib'
import { Rabbit } from '../../../utils/rabbit'
import { MongoShout, processedToMongoShout } from '../../persistor/persistor'
import { ProcessedShout } from '../../processor/processor'

export const ShoutsChannel = new SseChannel({
  historySize: 0,
  pingInternal: 60 * 1000,
  cors: {
    origins: ['*']
  }
})

export async function streamShoutEvents() {

  const channel = await Rabbit.createChannel()

  const consumer = channel.consume(config.RABBIT.API.INBOUND_QUEUE, async msg => {
    await ShoutsChannel.send({
      data: JSON.stringify(rabbitToApiShout(msg))
    })
    channel.ack(msg)
  }, {
    noAck: false
  })

  consumer.catch(async () => {
    await Rabbit.close()
    await ShoutsChannel.close()
  })

}

// maps the processed shout from Rabbit into one that's compliant with our API
function rabbitToApiShout(msg: Message): MongoShout {
  const payload = JSON.parse(msg.content.toString()) as ProcessedShout
  return processedToMongoShout(payload)
}
