import config from '../../utils/config'
const logger = config.Logger('SHOUTS_POLLER')

import { Observable, Observer } from 'rxjs/Rx'
import * as request from 'request'
import * as OrderedSet from 'fast-ordered-set'

/**
 * TTG's shoutbox is implemented using HTTP long polling, so we will have to long poll too.
 * However, the shoutbox endpoint TTG polls includes a `run` request paramter of 1, whose response
 * is any shouts within the last ~2000 milliseconds (?). This is problematic at times because if
 * the client's request hangs for any reason past the allotted time, they will miss the past shouts!
 * 
 * To not miss any shouts, we can specify a `run` parameter of 0, returning the most recent 25 shouts (+ some junk).
 * If we poll this endpoint, we have to filter out any shouts we've already seen before.
 * We do this by keeping track of the past 100 shouts via a sorted set. Why 100 if can only poll 25 at a time?
 * Good question, but I'm not too sure! I tried 50 but even then I was getting duplicates!
 * Probably related to when staff deletes shouts or something, but I can't be bothered to look into it further!
 * */

const shoutsLoad = (options = {}) => ({
  url: config.POLLER.REQUEST_URL,
  qs: config.POLLER.QUERY_STRING_PARAMS(options),
  headers: config.POLLER.HEADERS
})

const pollingInterval: number = 5000
const maxShouts = 100
const lastHundoShouts: any = new OrderedSet()

/* Returns an Observable emitting the recent shout items as an array.
 * We basically wrap the GET request of the shoutbox endpoint in an Observable.
 * If any part of the request fails (e.g. parsing the response body),
 * we retry up to five times, waiting twice our polling interval between each retry. */
function getRecentShoutItems(): Observable<any[]> {

  return Observable.create(observer => {
    request.get(shoutsLoad(), (error, response) => {
      if (error) {
        observer.error(error)
      } else {
        try {
          const items: any[] = JSON.parse(response.body).items
          observer.next(items)
          observer.complete()
        } catch (e) {
          observer.error(e)
        }
      }
    })
  })
  .retryWhen(errors => {
    return errors.delayWhen(e => {
      logger.error('Error while getting our recent shouts items!', e)
      return Observable.timer(2 * pollingInterval).first()
    })
  })
  .retry(5)

}

/* Returns an Observable emitting the recent shout items continuously (this time one-by-one). */
function pollRecentShoutItems(): Observable<any> {
  return Observable
    .timer(0, pollingInterval)
    .exhaustMap(time => getRecentShoutItems())
    .flatMap(items => items)
}

/* Returns an Observable of only the recent shout messages not seen before. */
function pollShoutMessages(): Observable<string> {
  return pollRecentShoutItems()
    .filter(item => item.hasOwnProperty('sm'))
    .map(item => item.sm)
    .filter(sm => isNewShout(sm))
}

/* Checks if a shout is new or not. It's a simple look-up with side-effects. */
function isNewShout(shoutHtml: string) {
  const shoutId = Number( shoutHtml.match(/id="shout_([^"]+)"/).pop() )
  if (lastHundoShouts.has(shoutId)) {
    return false;
  } else {
    lastHundoShouts.add(shoutId)
    if (lastHundoShouts.size > maxShouts) {
      const firstVal = lastHundoShouts.values[0];
      lastHundoShouts.delete(firstVal)
    }
    return true;
  }
}

/* Shout messages are just a shouts HTML. */
export const shoutMessages = pollShoutMessages
