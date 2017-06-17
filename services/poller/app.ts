import config from '../../utils/config'
const logger = config.Logger('SHOUTS_POLLER_APP')

import * as amqp from 'amqplib'
import { Rabbit } from '../../utils/rabbit'
import { shoutMessagesPoller } from './shouts-poller'

logger.info('Started poller service...')

const rawShouts = shoutMessagesPoller()

~async function startPolling() {

  const channel = await Rabbit.getChannel()

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
