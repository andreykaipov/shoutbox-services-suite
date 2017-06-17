import config from './config'
const logger = config.Logger('RABBIT-UTILS')

import * as amqp from 'amqplib'
import * as Bluebird from 'bluebird'

class RabbitUtils {

  private connection: amqp.Connection = null
  private channels: Set<amqp.Channel> = new Set()

  async getConnection() {
    this.connection = this.connection || await amqp.connect(process.env.SSS_RABBIT_CS)
    return this.connection
  }

  async getChannel() {
    const channel = await (await this.getConnection()).createChannel()
    this.channels.add(channel)
    return channel
  }

  async closeConnection() {
    (await this.getConnection()).close()
  }

  async closeChannels() {
    this.channels.forEach(this.closeChannel)
  }

  async closeChannel(channel: amqp.Channel) {
    channel.close()
  }

  async close() {
    this.closeConnection()
    this.closeChannels()
  }

}

export const Rabbit = new RabbitUtils()

const rabbit = config.RABBIT

async function setupRabbitTopology() {

  const channel = await Rabbit.getChannel()

  await channel.assertExchange(rabbit.POLLER.OUTBOUND_EXCHANGE, 'topic', { durable: true })
  await channel.assertQueue(rabbit.PROCESSOR.INBOUND_QUEUE, { durable: true })
  await channel.bindQueue(rabbit.PROCESSOR.INBOUND_QUEUE, rabbit.POLLER.OUTBOUND_EXCHANGE, '#')

  await channel.assertExchange(rabbit.PROCESSOR.OUTBOUND_EXCHANGE, 'topic', { durable: true })
  await channel.assertQueue(rabbit.REPOSITORY.INBOUND_QUEUE, { durable: true })
  await channel.bindQueue(rabbit.REPOSITORY.INBOUND_QUEUE, rabbit.PROCESSOR.OUTBOUND_EXCHANGE, '#')
  await channel.assertQueue(rabbit.API.INBOUND_QUEUE, { durable: true })
  await channel.bindQueue(rabbit.API.INBOUND_QUEUE, rabbit.PROCESSOR.OUTBOUND_EXCHANGE, '#')

  await Rabbit.close()
  logger.info('Asserted RabbitMQ topology succesfully!')

}

if (require.main === module) {
  setupRabbitTopology()
}
