// Copyright © 2025 Navarrotech

import { PipelineStage } from './PipelineStage'
import type { PipelineObject } from '../lib/PipelineObject'

// Utility
import { removeBackticks } from '../lib/llm'
import { touch } from '../lib/file'
import { getPrompt } from '../lib/prompts'

export class WriteStage extends PipelineStage {
  constructor() {
    super('Write')
    this.process = this.process.bind(this)
  }

  public async process(input: PipelineObject): Promise<PipelineObject> {
    // const importStatement = input.usesDefaultExport
    //   ? `import ${input.targetInputFunction} from '${input.relativeImportToTarget}'`
    //   : `import { ${input.targetInputFunction} } from '${input.relativeImportToTarget}'`

    // TODO: Temporarily hardcoded so I can move onto the next stage :)
    const importStatement = `import { ${input.targetInputFunction} } from './common.ts'`

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

    input.vitestFileContents = removeBackticks(result)

    touch(input.targetOutputFile, input.vitestFileContents)
    return input
  }
}
