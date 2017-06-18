import config from '../../utils/config'
const log = config.Logger('POLLER_APP')

import * as amqp from 'amqplib'
import { Rabbit } from '../../utils/rabbit'
import { shoutMessagesPoller } from './shouts-poller'

log.info('Started poller service...')

const rawShouts = shoutMessagesPoller()

~async function startPolling() {

  const channel = await Rabbit.getChannel()
  channel.prefetch(5)

  const subscription = rawShouts.subscribe(shoutHtml => {
    channel.publish(
      config.RABBIT.POLLER.OUTBOUND_EXCHANGE,
      'raw.html',
      new Buffer(shoutHtml)
    )
  })

  if (subscription.closed) {
    await Rabbit.close()
  }

}()
