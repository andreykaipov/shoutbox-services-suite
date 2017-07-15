import config from '../../../utils/config'
const log = config.Logger('API_VERSION_DELEGATE')

import * as express from 'express'

export interface VersionedRequest extends express.Request {
  version: string
}

export function versionDelegate(req: VersionedRequest, res: express.Response, next: express.NextFunction) {
  const matchVersion = req.url.match('/api/v(.)/')
  req.version = matchVersion ? `v${matchVersion.pop()}` : `v2`
  next()
}
