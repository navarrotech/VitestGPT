// Copyright © 2025 Navarrotech

import '../src/common/logging'

// Core
import { beforeEach, afterEach, vi } from 'vitest'
import { PipelineObject } from '../src/lib/PipelineObject'

// Typescript
import type { Mock } from 'vitest'

// Node.js
import os from 'os'
import fs from 'fs'

// Utilty
import { ensureFileExists } from '../src/lib/file'
import { v7 as uuid } from 'uuid'

export type CompletionsContext = {
  outputFilePath: string
  completionsMock: Mock
  completionsMockContent: string
  commonSamplePath: string
  commonFileContents: string
}

beforeEach<CompletionsContext>((context) => {
  // @ts-ignore
  context.completionsMockContent = 'DEFAULT MOCK RESPONSE'
  context.completionsMock = vi.fn(() => Promise.resolve({
    choices: [{
      message: {
        role: 'assistant',
        content: context.completionsMockContent
      }
    }]
  }))

  PipelineObject.completions = context.completionsMock

  context.outputFilePath = `${os.tmpdir()}/${uuid()}.test.ts`

  context.commonSamplePath = ensureFileExists('tests/samples/common.ts', 'Common sample file not found')
  context.commonFileContents = fs.readFileSync(context.commonSamplePath, 'utf-8')
})

afterEach<CompletionsContext>((context) => {
  if (fs.existsSync(context.outputFilePath)) {
    fs.unlinkSync(context.outputFilePath)
  }
  vi.clearAllMocks()
  vi.resetAllMocks()
  vi.restoreAllMocks()
})
