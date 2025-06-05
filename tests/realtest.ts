// Copyright © 2025 Navarrotech

import '../src/common/logging'

// Core
import { main } from '../src/entry'

// Node
import fs from 'fs'
import path from 'path'
import os from 'os'

// Misc
import { v7 as uuid } from 'uuid'
import { ensureFileExists } from '../src/lib/file'

const OUTPUT_FINAL_RESULT = path.join(process.cwd(), 'logs', 'realtest_results.json')
const COMMON_SAMPLE_PATH = ensureFileExists('tests/samples/common.ts', 'Common sample file not found')

async function runRealTest() {
  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'realtest-' + uuid())
  )
  console.log(`Temporary directory created: ${tmpDir}`)

  const tmpCommonPath = path.join(tmpDir, 'common.ts')
  fs.writeFileSync(
    tmpCommonPath,
    fs.readFileSync(COMMON_SAMPLE_PATH, 'utf-8')
  )

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
}

runRealTest().catch(console.error)
