// Copyright © 2025 Navarrotech

// Core
import './common/logging'
import { Command } from 'commander'
import { main } from './entry'

// Utiltiy
import { ensureFileExists } from './lib/file'

const program = new Command()

// Set version and description
program
  .name('VitestGPT')
  .version('1.0.0')
  .description('A CLI tool to generate Vitest unit tests using LLM AI')

// Define options
program
  .option(
    '-i, --input',
    'Target input file',
    (value) => ensureFileExists(value, 'Input file is required')
  )
  .option(
    '-f, --function',
    'Function name to test'
  )
  .option(
    '-o, --output',
    'Output file for generated tests',
    (value) => ensureFileExists(value, 'Output file is required')
  )

// Parse `process.argv`
program.parse(process.argv)

const options = program.opts<{
  input: string
  output: string
  function: string
}>()

logger.debug('Input file:', options.input)
logger.debug('Function name:', options.function)
logger.debug('Output file:', options.output)

main(options.input, options.function, options.output)
