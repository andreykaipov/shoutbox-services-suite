import config from './config'
const logger = config.Logger('RABBIT-UTILS')

import * as amqp from 'amqplib'
import * as Bluebird from 'bluebird'

// function channel() {
//   return connect()
//     .then(connection => connection.createChannel())
// }

const rawShoutMessagesX = 'raw.shout.messages'
const consumerOfRaw = 'shout.processor'

const rabbit = config.RABBIT

export async function rabbitChannel() {
  const connection = await amqp.connect(process.env.SSS_RABBIT_CS)
  return await connection.createChannel()
}

/*
function setupRabbit() {

  amqp.connect(process.env.SSS_RABBIT_CS)
    .then(con => {
      const ok = con.createChannel()
      ok.then(ch => {
        ch.assertExchange(rabbit.POLLER.OUTBOUND_EXCHANGE, 'topic', { durable: true })
          .then(ok => {
            ch.assertQueue(rabbit.PROCESSOR.INBOUND_QUEUE, { durable: true })
              .then(ok => {
                ch.bindQueue(rabbit.PROCESSOR.INBOUND_QUEUE, rabbit.POLLER.OUTBOUND_EXCHANGE, '#')
              })
          })
        ch.assertExchange(rabbit.PROCESSOR.OUTBOUND_EXCHANGE, 'topic', { durable: true })
          .then(ok => {
            Promise.all([
              ch.assertQueue(rabbit.REPOSITORY.INBOUND_QUEUE, { durable: true }),
              ch.assertQueue(rabbit.API.INBOUND_QUEUE, { durable: true })
            ])
              .then(ok => {
                ch.bindQueue(rabbit.REPOSITORY.INBOUND_QUEUE, rabbit.PROCESSOR.OUTBOUND_EXCHANGE, '#')
                ch.bindQueue(rabbit.API.INBOUND_QUEUE, rabbit.PROCESSOR.OUTBOUND_EXCHANGE, '#')
              })
          })
      })
      return ok.then(channel => con.close())
    })
    .catch(err => {
      logger.error('Something went wrong when setting up the exchanges and queues in Rabbit', err)
    })

}
*/

// .then(ch => {
//   Promise.all([
//     ch.assertExchange(rabbit.POLLER.OUTBOUND_EXCHANGE, 'topic', { durable: true })
//       .then(ok => {
//         ch.assertQueue(rabbit.PROCESSOR.INBOUND_QUEUE, { durable: true })
//           .then(ok => {
//             ch.bindQueue(rabbit.PROCESSOR.INBOUND_QUEUE, rabbit.POLLER.OUTBOUND_EXCHANGE, '#')
//           })
//       }),
//     ch.assertExchange(rabbit.PROCESSOR.OUTBOUND_EXCHANGE, 'topic', { durable: true })
//       .then(ok => {
//         Promise.all([
//           ch.assertQueue(rabbit.REPOSITORY.INBOUND_QUEUE, { durable: true }),
//           ch.assertQueue(rabbit.API.INBOUND_QUEUE, { durable: true })
//         ])
//         .then(ok => {
//           ch.bindQueue(rabbit.REPOSITORY.INBOUND_QUEUE, rabbit.PROCESSOR.OUTBOUND_EXCHANGE, '#')
//           ch.bindQueue(rabbit.API.INBOUND_QUEUE, rabbit.PROCESSOR.OUTBOUND_EXCHANGE, '#')
//         })
//       })
//   ])
//   .then(ok => {
//     // ch.close()
//   })
// })

// setupRabbit()

// function sendToQueue(q: string) {
//   channel().then(ch => {
//     return ch.assertQueue(q, { durable: true })
//   })
// }
