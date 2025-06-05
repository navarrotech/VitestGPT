// Copyright © 2025 Navarrotech

import { PipelineStage } from './PipelineStage'
import type { PipelineObject } from '../lib/PipelineObject'

import { getPrompt } from '../lib/prompts'
import path from 'path'

export class WriteStage extends PipelineStage {
  constructor() {
    super('Write')
    this.process = this.process.bind(this)
  }

  public async process(input: PipelineObject): Promise<PipelineObject> {
    const inputFileName = path.basename(input.targetInputFile)

    const importStatement = input.usesDefaultExport
      ? `import ${input.targetInputFunction} from './${inputFileName}'`
      : `import { ${input.targetInputFunction} } from './${inputFileName}'`

    const prompt = getPrompt('writeUnitTests', {
      function: input.isolatedFunctionContents,
      testplan: input.testplan,
      language: input.lang,
      importStatement,
      functionName: input.targetInputFunction
    })

    const result = await input.sendHumanPrompt(prompt, 'o4-mini', false)
    if (!result) {
      input.continue = false
      input.log(`WriteStage: No response from LLM for ${input.targetInputFunction}`)
      return input
    }

    input.vitestFileContents = result

    return input
  }
}

// npx vitest -t "adds two numbers"
// vitest --run --testNamePattern="adds two numbers"
// npx vitest -t "/adds.*numbers/"
// npx vitest path/to/my-utils.test.ts
