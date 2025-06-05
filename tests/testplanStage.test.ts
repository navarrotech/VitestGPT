// Copyright © 2025 Navarrotech

// Core
import { describe, it, expect, beforeEach } from 'vitest'

// Typescript
import type { PipelineStage } from '../src/pipeline/PipelineStage'
import type { CompletionsContext } from './vitest.setup'

// Lib to test
import { TestplanStage } from '../src/pipeline/2_testplan'

// Lib
import { PipelineObject } from '../src/lib/PipelineObject'
import { mockConsole } from './common/mockConsole'

type Context = {
  object: PipelineObject
  stage: PipelineStage
} & CompletionsContext

describe('Testplan Stage', () => {
  beforeEach<Context>((context) => {
    context.stage = new TestplanStage()
    context.object = new PipelineObject(context.commonSamplePath, 'deepClone', context.outputFilePath)
    globalThis.logger = mockConsole()
  })

  it<Context>('unit tests should be setup properly', (context) => {
    expect(context.commonSamplePath).toBeDefined()
    expect(context.outputFilePath).toBeDefined()
    expect(context.object).toBeDefined()
    expect(context.stage).toBeDefined()
    expect(context.object.targetInputFile).toBe(context.commonSamplePath)
    expect(context.object.targetOutputFile).toBe(context.outputFilePath)
  })

  it<Context>('run setup stage', async (context) => {
    context.completionsMockContent = 'This is a test plan for the deepClone function.'

    // Run the setup stage
    const result = await context.stage.run(context.object)

    expect(result).toBeDefined()
    expect(result.continue).toBe(true)
    expect(result.testplan).toBe(context.completionsMockContent)
  })
})
