// Copyright © 2025 Navarrotech

import { runCommand } from './process'
import path from 'path'
import { fileURLToPath } from 'url'

export async function getBestVitestPath(): Promise<[string, string[]]> {
  const [ , globalExit ] = await runCommand(
    'vitest',
    [ '--version' ]
  )
  if (globalExit === 0) {
    logger.debug('Found a global vitest to use')
    return [ 'vitest', []]
  }

  // 2) Check local via npx (no-install)
  const [ , localExit ] = await runCommand(
    'npx',
    [ '--no-install', 'vitest', '--version' ]
  )
  if (localExit === 0) {
    logger.debug('Found a local vitest to use')
    return [ 'npx', [ '--no-install' ]]
  }

  // 3) Check node_modules/.bin directly
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.resolve(__filename, '..')

  // On Unix/macOS, local binaries live under node_modules/.bin/vitest
  // On Windows, it’ll actually be vitest.cmd
  const vitestBin = path.resolve(
    __dirname,
    '../node_modules/.bin/vitest'
  )

  const [ , binExit ] = await runCommand(vitestBin, [ '--version' ])
  if (binExit === 0) {
    logger.debug('Found a local vitest binary to use')
    return [ vitestBin, []]
  }

  // 4) Not found: error out
  logger.error(
    'Error: vitest is not installed on this machine.\n'
      + '→ To install globally, run: npm install -g vitest\n'
      + 'Or add it as a dev dependency and invoke via npx:\n'
      + '  npm install --save-dev vitest\n'
      + '  npx vitest'
  )
  process.exit(1)
  return [ '', []]
}

const bestVitestPath = getBestVitestPath()
getBestVitestPath().then(console.log)

export async function runVitest(vitestFilePath: string, testNamePattern?: string) {
  // npx vitest -t "adds two numbers"
  // vitest --run --testNamePattern="adds two numbers"
  // npx vitest -t "/adds.*numbers/"
  // npx vitest path/to/my-utils.test.ts

  const [ cmd, cmdArgs ] = await bestVitestPath

  const args = [
    ...cmdArgs,
    'run',
    testNamePattern && `--testNamePattern=${testNamePattern}`,
    vitestFilePath
  ].filter(Boolean)

  return await runCommand(cmd, args)
}
