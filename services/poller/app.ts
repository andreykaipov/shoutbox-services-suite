import config from '../../utils/config'
const logger = config.Logger('SHOUTS_POLLER_APP')

import * as amqp from 'amqplib'
import { shoutMessages } from './shouts-poller'
import { rabbitChannel } from '../../utils/rabbit';

const rawShouts = shoutMessages()

~async function startPolling() {

  const channel = await rabbitChannel()

  const subscription = rawShouts.subscribe(shoutHtml => {
    channel.publish(config.RABBIT.POLLER.OUTBOUND_EXCHANGE, 'raw.html', new Buffer(shoutHtml))
    logger.info('published', shoutHtml)
  })
  
  if (subscription.closed) {
    await channel.close()
  }

}()
