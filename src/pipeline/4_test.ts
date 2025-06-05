// Copyright © 2025 Navarrotech

import { PipelineStage } from './PipelineStage'
import type { PipelineObject } from '../lib/PipelineObject'

// Node
import fs from 'fs'

// Utility
import { openai } from '../lib/llm'
import { removeBackticks } from '../lib/prompts'
import { runVitest } from '../lib/vitest'
import { getPrompt } from '../lib/prompts'
import { watchFileUntil } from '../lib/file'
import { RECURSIVE_ATTEMPT_LIMIT, LLM_MODEL } from '../constants'

export class TestStage extends PipelineStage {
  constructor() {
    super('Test')
    this.process = this.process.bind(this)
  }

  public async process(input: PipelineObject): Promise<PipelineObject> {
    let iterations = 0
    while (iterations < RECURSIVE_ATTEMPT_LIMIT) {
      iterations++

      const [ result, exitCode, command ] = await runVitest(
        input.targetOutputFile
      )

      input.compileResults.push({
        result,
        exitCode
      })

      if (exitCode === 0) {
        input.log('All tests passed successfully!!')
        break
      }

      // If the test fails, we need to improve the test plan
      const newTestPlan = getPrompt('onTestFailed', {
        command,
        vitestOutput: result
      })
      input.log('Improving test plan...')
      const improvementResult = await input.sendHumanPrompt(newTestPlan)
      const [ action, message ] = extractActionFromImprovementResult(improvementResult)

      if (!action) {
        // The only downside here, is it will count towards our total iterations
        // But we don't want to exit the loop, we want to try again
        input.log('The LLM did not respond with a valid action in the improvement result... trying again...')
        logger.warn('NO ACTION WAS FOUND IN: ', improvementResult)
        // Remove the last message (the LLM response)
        input.conversationHistory.pop()
        // Make it go try again!
        continue
      }

      if (action === 'exit') {
        input.log('Exiting test stage as per LLM request.')
        input.messageToUser = message
        input.log(message)
        input.continue = false
        return input
      }

      else if (action === 'fix-unit-test') {
        input.log('Fixing unit test as per LLM request...')
        fs.writeFileSync(
          input.targetOutputFile,
          message
        )
      }

      else if (action === 'fix-source-code') {
        // input.log('Fixing source code as per LLM request...')
        // input.conversationHistory.push({
        //   role: 'assistant',
        //   content: message
        // })
        // // Here we would typically modify the source code, but for now, we just log it
        // input.sourceCode = message
        await fixSourceCode(input, message)
      }
    }

    if (iterations >= RECURSIVE_ATTEMPT_LIMIT) {
      input.log(`Test stage failed after ${RECURSIVE_ATTEMPT_LIMIT} iterations, aborting pipeline.`)
      input.continue = false
      return input
    }

    return input
  }
}

function extractActionFromImprovementResult(
  improvementResult: string
): ['fix-unit-test' | 'fix-source-code' | 'exit' | null, string] {
  improvementResult = removeBackticks(improvementResult)

  // If the improvement should begin with one of these:
  // 1. fix-unit-test
  // 2. fix-source-code
  // 3. exit

  const match = improvementResult.match(/^\s*\/\/\s*fix-unit-test\s*/i)
  if (match) {
    const strippedResult = improvementResult.slice(match[0].length)
    return [ 'fix-unit-test', strippedResult ]
  }

  // 2) fix‐source‐code
  const sourceCodeMatch = improvementResult.match(/^\s*\/\/\s*fix-source-code\s*/i)
  if (sourceCodeMatch) {
    const strippedResult = improvementResult.slice(sourceCodeMatch[0].length)
    return [ 'fix-source-code', strippedResult ]
  }

  // 3) exit
  const exitMatch = improvementResult.match(/^\s*\/\/\s*exit\s*/i)
  if (exitMatch) {
    const strippedResult = improvementResult.slice(exitMatch[0].length)
    return [ 'exit', strippedResult ]
  }

  return [ null, null ]
}

async function fixSourceCode(input: PipelineObject, message: string): Promise<void> {
  // If this occurs, the message is going to be a diff of the source code using conflict markers
  // The problem is, it's a diff of the snippet of source code, not the full source code
  // We're going to use chatgpt to apply the diff to the full source code again

  // Ask chatgpt to apply the diff to the FULL source code
  input.log('Applying diff to source code...')
  const prompt = getPrompt('applyDiffToSourceCode', {
    diff: message,
    sourceCode: input.targetRawInputFileContents
  })

  const response = await openai.chat.completions.create({
    model: LLM_MODEL,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  const responseContent = response.choices[0].message.content
  fs.writeFileSync(
    input.targetInputFile,
    responseContent
  )

  // Grace period to allow the user to fix the source code
  await new Promise((accept) => setTimeout(accept, 500))

  // If there's no more conflict markers, we can assume the user has fixed the source code
  await watchFileUntil(
    input.targetInputFile,
    (fileContent) => {
      const hasConflictMarkers = fileContent.includes('<<<<<<< HEAD')
        || fileContent.includes('=======')
        || fileContent.includes('>>>>>>>')

      if (!hasConflictMarkers) {
        input.log('Source code fixed by user, continuing pipeline...')
        return true
      }
      else {
        input.log('Waiting for user to fix source code...')
        return false
      }
    }
  )
}
