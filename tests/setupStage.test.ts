// Copyright © 2025 Navarrotech

// Core
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Typescript
import type { PipelineStage } from '../src/pipeline/PipelineStage'

// Node
import os from 'os'
import fs from 'fs'

// Lib
import { PipelineObject } from '../src/lib/PipelineObject'
import { SetupStage } from '../src/pipeline/0_setup'
import { ensureFileExists } from '../src/lib/file'
import { mockConsole } from './common/mockConsole'
import { v7 as uuid } from 'uuid'

const COMMON_SAMPLE_PATH = ensureFileExists('tests/samples/common.ts', 'Common sample file not found')
const commonFileContents = fs.readFileSync(COMMON_SAMPLE_PATH, 'utf-8')

type Context = {
  object: PipelineObject
  stage: PipelineStage
  outputFilePath: string
}

describe('Setup Stage', () => {
  beforeEach<Context>((ctx) => {
    ctx.outputFilePath = `${os.tmpdir()}/${uuid()}.test.ts`
    ctx.stage = new SetupStage()
    ctx.object = new PipelineObject(COMMON_SAMPLE_PATH, 'deepClone', ctx.outputFilePath)
    globalThis.logger = mockConsole()
  })

  afterEach<Context>((ctx) => {
    if (fs.existsSync(ctx.outputFilePath)) {
      fs.unlinkSync(ctx.outputFilePath)
    }
  })

  it<Context>('unit tests should be setup properly', (ctx) => {
    expect(COMMON_SAMPLE_PATH).toBeDefined()
    expect(ctx.outputFilePath).toBeDefined()
    expect(ctx.object).toBeDefined()
    expect(ctx.stage).toBeDefined()
    expect(ctx.object.targetInputFile).toBe(COMMON_SAMPLE_PATH)
    expect(ctx.object.targetOutputFile).toBe(ctx.outputFilePath)
  })

  it<Context>('run setup stage', async (context) => {
    // Before the test, ensure the stage hasn't done anything yet
    expect(context.object.targetRawInputFileContents).toBeUndefined()
    expect(fs.existsSync(context.outputFilePath)).toBe(false)

    // Run the setup stage
    const result = await context.stage.run(context.object)

    expect(result).toBeDefined()
    if (!result) {
      throw new Error('Result is undefined')
    }

    // Test the results

    // Ensure that the input file was read
    expect(result.targetRawInputFileContents).toBeDefined()
    expect(result.targetRawInputFileContents).toBe(commonFileContents)

    // Ensure that it created an output file
    expect(fs.existsSync(context.outputFilePath)).toBe(true)
    expect(fs.statSync(context.outputFilePath).isFile()).toBe(true)
  })
})
