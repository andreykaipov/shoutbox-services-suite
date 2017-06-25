import config from './config'
const log = config.Logger('RABBIT_UTILS')

import * as amqp from 'amqplib'

export namespace Rabbit {

  let con: amqp.Connection = null

  export async function connect(uri: string) {
    con = await amqp.connect(uri)
  }

  export async function createChannel() {
    return con.createChannel()
  }

  export async function close() {
    return con.close()
  }

}

const rabbit = config.RABBIT

async function setupRabbitTopology() {

  await Rabbit.connect(process.env.SSS_RABBIT_CS)
  const channel = await Rabbit.createChannel()

  await channel.assertExchange(rabbit.POLLER.OUTBOUND_EXCHANGE, 'fanout', { durable: true })
  await channel.assertQueue(rabbit.PROCESSOR.INBOUND_QUEUE, { durable: true })
  await channel.bindQueue(rabbit.PROCESSOR.INBOUND_QUEUE, rabbit.POLLER.OUTBOUND_EXCHANGE, '')

  await channel.assertExchange(rabbit.PROCESSOR.OUTBOUND_EXCHANGE, 'fanout', { durable: true })
  await channel.assertQueue(rabbit.PERSISTOR.INBOUND_QUEUE, { durable: true })
  await channel.bindQueue(rabbit.PERSISTOR.INBOUND_QUEUE, rabbit.PROCESSOR.OUTBOUND_EXCHANGE, '')
  await channel.assertQueue(rabbit.API.INBOUND_QUEUE, { durable: true })
  await channel.bindQueue(rabbit.API.INBOUND_QUEUE, rabbit.PROCESSOR.OUTBOUND_EXCHANGE, '')

  await channel.close()
  await Rabbit.close()
  log.info('Asserted RabbitMQ topology succesfully!')

}

if (require.main === module) {
  setupRabbitTopology()
}
