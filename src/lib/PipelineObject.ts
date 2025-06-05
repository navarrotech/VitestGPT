// Copyright © 2025 Navarrotech

// Core
import { v7 as uuid } from 'uuid'
import { openai } from './llm'
import { getPrompt } from './prompts'

// Typescript
import type { ChatCompletionMessageParam, ChatModel } from 'openai/resources'

// Misc
import { LLM_MODEL } from '../constants'

const systemPrompt = getPrompt('systemPrompt')

export class PipelineObject {
  public id: string = uuid()
  public continue: boolean = true

  // Targets
  public targetInputFile: string
  public targetInputFunction: string
  public targetOutputFile: string
  public packageJsonFile: string
  public relativeImportToTarget: string

  // File contents
  public packageJsonContents: string
  public targetRawInputFileContents: string
  public isolatedFunctionContents: string
  public lang: 'typescript' | 'javascript'
  public usesDefaultExport: boolean = false

  // LLM Client
  public conversationHistory: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt
    }
  ]

  public static completions = openai.chat.completions.create.bind(openai.chat.completions)

  // GPT generated content
  public testplan: string
  public vitestFileContents: string
  public messageToUser: string

  // Results
  public compileResults: {
    result: string
    exitCode: number
  }[] = []

  constructor(
    targetInputFile: string,
    targetFunctionName: string,
    targetOutputFile: string
  ) {
    // Set the target files and function name
    this.targetInputFile = targetInputFile
    this.targetOutputFile = targetOutputFile
    this.targetInputFunction = targetFunctionName
  }

  public async sendHumanPrompt(
    prompt: string,
    model: ChatModel = LLM_MODEL,
    useHistory: boolean = true
  ): Promise<string> {
    this.log('Sending human prompt:', prompt)
    this.conversationHistory.push({
      role: 'user',
      content: prompt
    })

    this.log('Waiting for a response from llm...')
    const response = await PipelineObject.completions({
      model,
      messages: useHistory
        ? this.conversationHistory
        : [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ]
    })

    const content = response.choices[0].message.content

    this.log('LLM Response:', content)
    this.conversationHistory.push({
      role: 'assistant',
      content
    })

    return content
  }

  public log(...args: any[]): void {
    logger.info(...args)
  }
}
