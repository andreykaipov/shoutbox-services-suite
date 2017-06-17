import * as winston from 'winston'
import * as fs from 'fs'

if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

export default function Logger(prefix: string, logFile: boolean | string = true) {

  const logFormat = options => `\
    [${prefix}] ${options.level.toUpperCase()} ${options.timestamp()} ${options.message ? options.message : ''}\
    ${options.meta && Object.keys(options.meta).length ? `\nmeta: ${JSON.stringify(options.meta)}` : ''}\
  `.trim()

  const transports: any = [
    new winston.transports.Console({
      timestamp: () => new Date().toISOString(),
      formatter: logFormat
    })
  ]

  if (logFile) {
    logFile = typeof logFile === 'string' ? logFile : `${prefix.toLowerCase()}.log`
    transports.push(
      new winston.transports.File({
        filename: `./logs/${logFile}`,
        level: 'verbose'
      })
    )
  }

  return new winston.Logger({
    transports: transports
  })

}
