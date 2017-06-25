import config from './config'
const log = config.Logger('MONGO_UTILS')

import { Mongo as MongoDbPool } from 'mongodb-pool'

export namespace Mongo {

  export async function getConnection() {
    return MongoDbPool.getConnection(process.env.SSS_MONGO_CS, {
      poolSize: 1,
      keepAlive: 1,
      connectTimeoutMS: 30000
    })
  }

  export function getDb() {
    return MongoDbPool.getDb()
  }

}
