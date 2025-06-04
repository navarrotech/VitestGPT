// Copyright © 2025 Navarrotech

// Core
import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'


export const logger = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    //
    // - Write all logs with importance level of `info` or higher to `app.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    new transports.File({ filename: 'logs/app.log' }),
    // Also log to the console
    new transports.Console({
      format: format.simple()
    })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/error.log' })
  ]
})

logger.configure({
  level: 'verbose',
  transports: [
    new DailyRotateFile({

    })
  ]
})

// @ts-ignore
globalThis.logger = logger
