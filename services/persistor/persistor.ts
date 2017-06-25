import config from '../../utils/config'
const log = config.Logger('SHOUTS_REPOSITORY')

import { Collection } from 'mongodb'
import { Mongo } from 'mongodb-pool'
import { ProcessedShout } from '../processor/processor'

export interface MongoShout {
  _id: number
  timestamp: Date,
  author_id: number,
  author_name?: string,
  author_color?: string,
  content: string
}

export class Persistor {

  constructor(
    private shouts = Mongo.getCollection('shouts'),
    private users = Mongo.getCollection('users')
  ) { }

  async saveShout(shout: ProcessedShout) {

    await this.shouts.insertOne({
      _id: shout.id,
      timestamp: new Date(shout.timestamp),
      author_id: shout.authorId,
      author_name: shout.authorName,
      author_color: shout.authorColor,
      content: shout.content
    }).then(res => {
      log.verbose('Persisted shout', shout.id)
    }).catch(err => {
      log.warn('Error while persisting shout', err.message)
    })
    await this.trackUser(shout)

  }

  /* Tracks a user by the given shout.
   * Only thing we can practically track is a user's past names! */
  async trackUser(shout: ProcessedShout) {

    const userId = shout.authorId
    const userName = shout.authorName
    const timestamp = new Date(shout.timestamp)

    const userDocument = await this.users.findOne({ _id: userId })

    if (!userDocument) {
      await this.users.insertOne({
        _id: userId,
        current_name: userName,
        name_first_seen: timestamp,
        past_names: []
      })
    } else {
      if (userDocument.current_name === userName) {
        return
      }
      userDocument.past_names.push({
        name: userDocument.current_name,
        name_first_seen: userDocument.name_first_seen
      })
      await this.users.updateOne({ _id: userId }, {
        _id: userId,
        current_name: userName,
        name_first_seen: timestamp,
        past_names: userDocument.past_names
      }).then(result => {
        log.verbose(`Persisted user with new name. User ${userId} is now ${userName}.`)
      }).catch(err => {
        log.warn('Error while persisting user', err.message)
      })

    }

  }

}
