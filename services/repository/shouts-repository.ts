import config from '../../utils/config'
const log = config.Logger('SHOUTS_REPOSITORY')

import * as mongojs from 'mongojs'
import { ProcessedShout } from '../processor/shouts-processor'

let shouts
let users

export async function initMongo() {
  const db = mongojs(process.env.SSS_MONGO_CS)
  shouts = db.collection('shouts')
  users = db.collection('users')
  return {
    persistShout: persistShout
  }
}

async function persistShout(shout: ProcessedShout) {

  shouts.insert({
    _id: shout.id,
    timestamp: shout.timestamp,
    author_id: shout.authorId,
    author_name: shout.authorName,
    author_color: shout.authorColor,
    content: shout.content
  }, (err, doc) => {
    if (err != null) {
      log.warn('Error while persisting shout', err.errmsg)
    } else {
      log.verbose('Persisted shout', shout.id)
    }
  })

  trackUser(shout)

}

/* Tracks a user by the given shout.
 * Only thing we can practically track is a user's past names! */
async function trackUser(shout: ProcessedShout) {

  const userId = shout.authorId
  const userName = shout.authorName
  const timestamp = shout.timestamp

  users.find({ _id: userId }, (err, docs) => {

    if (docs.length === 0) {
      users.insert({
        _id: userId,
        current_name: userName,
        name_first_seen: timestamp,
        past_names: []
      })
    } else {
      const userDocument = docs.pop() // there's only ever gonna be one
      if (userDocument.current_name === userName) {
        return false
      }
      userDocument.past_names.push({
        name: userDocument.current_name,
        name_first_seen: userDocument.name_first_seen
      })
      this.users.update({ _id: userId }, {
        _id: userId,
        current_name: userName,
        name_first_seen: timestamp,
        past_names: userDocument.past_names
      })
    }

  })

}
