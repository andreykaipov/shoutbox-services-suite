import config from '../../utils/config'
const log = config.Logger('API_SSE')

import SseChannel = require('sse-channel')
import { Rabbit } from '../../utils/rabbit'

export const ShoutsChannel = new SseChannel({
  historySize: 0,
  pingInternal: 60 * 1000,
  cors: {
    origins: ['*']
  }
})

export async function streamEvents() {

  const channel = await Rabbit.createChannel()

  const consumer = channel.consume(config.RABBIT.API.INBOUND_QUEUE, async msg => {

    const payload = msg.content.toString()
    await ShoutsChannel.send({ data: msg.content.toString() })
    channel.ack(msg)

  }, { noAck: false })

  consumer.catch(async () => {
    await Rabbit.close()
    await ShoutsChannel.close()
  })

}
