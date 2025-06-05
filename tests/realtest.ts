// Copyright © 2025 Navarrotech

import '../src/common/logging'

// Core
import { main } from '../src/entry'

// Node
import fs from 'fs'
import path from 'path'

// Misc
import { v7 as uuid } from 'uuid'
import { ensureFileExists } from '../src/lib/file'

const tmpDir = path.join('realtests/realtest-' + uuid())
fs.mkdirSync(tmpDir, { recursive: true })

const OUTPUT_FINAL_RESULT = path.join(tmpDir, 'realtest_results.json')
const SAMPLES_DIR = 'tests/samples'
const COMMON_SAMPLE_PATH = ensureFileExists(path.join(SAMPLES_DIR, 'common.ts'), 'Common sample file not found')

// Copy all files from tests/samples to tmpDir
fs.readdirSync(SAMPLES_DIR).forEach((file) => {
  const srcPath = path.join(SAMPLES_DIR, file)
  const destPath = path.join(tmpDir, file)
  if (fs.statSync(srcPath).isFile()) {
    fs.writeFileSync(destPath, fs.readFileSync(srcPath, 'utf-8'))
  }
})

async function runRealTest() {
  console.log(`Ephemeral directory created: ${tmpDir}`)

  const tmpOutputPath = path.join(
    tmpDir,
    'deepClone.test.ts'
  )

  const result = await main(
    COMMON_SAMPLE_PATH,
    'deepClone',
    tmpOutputPath
  )

  fs.writeFileSync(
    OUTPUT_FINAL_RESULT,
    JSON.stringify(result, null, 2)
  )

  // Copy the logs/app.log into the tmpDir
  const logFilePath = path.join('logs', 'app.log')
  if (fs.existsSync(logFilePath)) {
    const logContent = fs.readFileSync(logFilePath, 'utf-8')
    fs.writeFileSync(path.join(tmpDir, 'app.log'), logContent)
  }

  console.log(`Final results written to:\n${OUTPUT_FINAL_RESULT}`)
  console.log(`REALTEST FINISHED - You can access the ephemeral directory created at:\n${tmpDir}`)
}

runRealTest().catch(console.error)
