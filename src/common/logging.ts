// Copyright © 2025 Navarrotech

import { forEachFileInDirectory, touch } from '../lib/file'

import fs from 'fs'
import path from 'path'

const logsDir = path.join(process.cwd(), 'logs')
const ephemeralLogsDir = path.join(logsDir, 'ephemeral')

const mainLogs = path.join(logsDir, 'app.log')

forEachFileInDirectory(ephemeralLogsDir, (filePath) => {
  // If the file has existed for more than 7 days, delete it
  try {
    const stats = fs.statSync(filePath)
    const now = new Date()
    const fileAgeInDays = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)

    if (fileAgeInDays > 7) {
      fs.unlinkSync(filePath)
    }
  }
  catch (error) {
    console.error(`Error processing file ${filePath}:`, error)
  }
}, true)

// Purge all main logs before continuing
if (fs.existsSync(mainLogs)) {
  fs.unlinkSync(mainLogs)
}
touch(mainLogs, '')

export type Logger = {
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  debug: (...args: any[]) => void
  log: (...args: any[]) => void
  to: (target: string, ...args: any[]) => void
}


function persistTo(outputPath: string, ...args: any[]): void {
  outputPath = path.resolve(outputPath)

  // Ensure the directory exists
  const dir = path.dirname((outputPath))
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Reformat the messages
  const messages = args.map(reformatMessage).join(' ')

  // Append the messages to the file
  if (!fs.existsSync(outputPath)) {
    // Create the file if it doesn't exist
    fs.writeFileSync(outputPath, '', 'utf8')
  }

  fs.appendFileSync(outputPath, messages + '\n', 'utf8')
}

function reformatMessage(input: any): string {
  if (typeof input === 'object') {
    return JSON.stringify(input, null, 2)
  }
  if (input instanceof Error) {
    return `${input.name}: ${input.message}\n${input.stack}`
  }

  return String(input)
}

const logger: Logger = {
  log: (...args: any[]) => {
    persistTo(mainLogs, ...args)
    console.log(...args)
  },
  info: (...args: any[]) => {
    persistTo(mainLogs, ...args)
    console.info(...args)
  },
  warn: (...args: any[]) => {
    persistTo(mainLogs, ...args)
    console.warn(...args)
  },
  error: (...args: any[]) => {
    persistTo(mainLogs, ...args)
    console.error(...args)
  },
  debug: (...args: any[]) => {
    persistTo(mainLogs, ...args)
    console.debug(...args)
  },
  to: (target: string, ...args: any[]) => {
    const outputPath = path.join(ephemeralLogsDir, target)
    persistTo(outputPath, ...args)
  }
}

globalThis.logger = logger
