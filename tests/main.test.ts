// Copyright © 2025 Navarrotech

// Core
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Node
import os from 'os'
import fs from 'fs'

// Lib
import { main } from '../src/entry'
import { ensureFileExists } from '../src/lib/file'
import { v7 as uuid } from 'uuid'
import { mockConsole } from './common/mockConsole'

const COMMON_SAMPLE_PATH = ensureFileExists('tests/samples/common.ts', 'Common sample file not found')

type Context = {
  outputFilePath: string
}

describe('Main process', () => {
  beforeEach<Context>((ctx) => {
    ctx.outputFilePath = `${os.tmpdir()}/${uuid()}.test.ts`
    globalThis.logger = mockConsole()
  })

  afterEach<Context>((ctx) => {
    if (fs.existsSync(ctx.outputFilePath)) {
      fs.unlinkSync(ctx.outputFilePath)
    }
  })

  it<Context>('should ensure the common sample path exists', () => {
    expect(COMMON_SAMPLE_PATH).toBeDefined()
  })

  it<Context>('should run common:deepClone with no errors', async (context) => {
    const result = await main(COMMON_SAMPLE_PATH, 'deepClone', context.outputFilePath)

    expect(result).toBeDefined()
    if (!result) {
      throw new Error('Result is undefined')
    }

    // eslint-disable-next-line
    const { targetRawInputFileContents, ...rest } = result
    // console.log(rest)

    expect(result).toBeDefined()
  })
})
