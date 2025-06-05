// Copyright © 2025 Navarrotech

// Core
import { describe, it, expect } from 'vitest'
import { PipelineObject } from '../src/lib/PipelineObject'

// Typescript
import type { CompletionsContext } from './vitest.setup'

describe('Unit tests', () => {
  it<CompletionsContext>('unit tests should be setup properly', (context) => {
    expect(context.commonSamplePath).toBeDefined()
    expect(context.commonSamplePath).not.toBe('')
    expect(context.commonFileContents).toBeDefined()
    expect(context.commonFileContents).not.toBe('')
    expect(context.completionsMock).toBeDefined()
    expect(context.completionsMock).toBeInstanceOf(Function)
    expect(context.completionsMockContent).toBeDefined()
    expect(context.completionsMockContent).not.toBe('')
    expect(context.outputFilePath).toBeDefined()
    expect(context.outputFilePath).not.toBe('')
  })

  it<CompletionsContext>('should have openai mocked properly', async (context) => {
    expect(PipelineObject.completions).toBeDefined()
    context.completionsMockContent = 'Valhalla is an epic Norse mythological hall where warriors go after death.'

    const object = new PipelineObject(context.commonSamplePath, 'deepClone', context.outputFilePath)
    const test = await object.sendHumanPrompt('What is Valhalla?')

    expect(test).toBeDefined()
    expect(context.completionsMock).toHaveBeenCalledTimes(1)
    expect(test).toBe(context.completionsMockContent)
  })
})
