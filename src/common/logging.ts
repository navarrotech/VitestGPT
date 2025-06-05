// Copyright © 2025 Navarrotech

// Core
import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

// Typescript
import type { Logger } from 'winston'

// Create a logger that:
// 1. Combines an “errors” formatter (so Error.stack is preserved) with JSON and timestamp
// 2. Writes errors → logs/error.log, info+ → logs/app.log
// 3. Prints colorized, stack-preserving output to the console
export const logger: Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json()
  ),
  transports: [
    // Rotate error logs daily, keep 14 days, compress old files
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // Rotate all info+ logs daily
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // Also log to the console with stack traces and colorized output
    new transports.Console({
      format: format.combine(
        format.errors({ stack: true }),
        format.colorize(),
        format.simple()
      )
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
})

// @ts-ignore
globalThis.logger = logger
