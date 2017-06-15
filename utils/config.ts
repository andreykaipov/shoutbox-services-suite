import * as dotenv from 'dotenv'
import Logger from './logger';

dotenv.config({ path: './env' })

const POLLER_CONFIG = {
  HEADERS: {
    'Host': 'process.env.SSS_HOST',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:51.0) Gecko/20100101 Firefox/51.0',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://process.env.SSS_HOST/Members_Shout.html',
    'X-Requested-With': 'XMLHttpRequest',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Cookie': `user=${process.env.SSS_POLLER_COOKIE_USER};PHPSESSID=${process.env.SSS_POLLER_COOKIE_PHPSESSID};`
  },
  REQUEST_URL: 'https://process.env.SSS_HOST/modules.php',
  QUERY_STRING_PARAMS: (options = {}) => ({
    name: 'Members_Shout',
    file: 'ajax_shout',
    op: 'json_load',
    ...options
  })
}

const RABBIT_CONFIG = {
  POLLER: {
    OUTBOUND_EXCHANGE: 'raw.shouts'
  },
  PROCESSOR: {
    INBOUND_EXCHANGE: 'raw.shouts',
    INBOUND_QUEUE: 'shout.processor',
    OUTBOUND_EXCHANGE: 'processed.shouts'
  },
  REPOSITORY: {
    INBOUND_EXCHANGE: 'processed.shouts',
    INBOUND_QUEUE: 'shouts.repository'
  },
  API: {
    INBOUND_EXCHANGE: 'processed.shouts',
    INBOUND_QUEUE: 'shouts.api'
  }
}

/* Our files should instantiate a logger via this export,
 * in order to trigger Typescript's module resolution to evaluate the above config. */
export default {
  env: process.env,
  Logger: Logger,
  POLLER: POLLER_CONFIG,
  RABBIT: RABBIT_CONFIG
}
