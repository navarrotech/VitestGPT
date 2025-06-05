// Copyright © 2025 Navarrotech

// Core
import { describe, it, expect, beforeEach } from 'vitest'

// Typescript
import type { CompletionsContext } from './vitest.setup'

// Lib
import { main } from '../src/entry'
import { mockConsole } from './common/mockConsole'

type Context = {

} & CompletionsContext

describe('Main process', () => {
  beforeEach<Context>(() => {
    globalThis.logger = mockConsole()
  })

  it<Context>('should ensure the common sample path exists', (context) => {
    expect(context.commonSamplePath).toBeDefined()
  })

  it<Context>('should run common:deepClone with no errors', async (context) => {
    const result = await main(context.commonSamplePath, 'deepClone', context.outputFilePath)

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
