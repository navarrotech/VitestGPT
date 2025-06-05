// Copyright © 2025 Navarrotech

import { PipelineStage } from './PipelineStage'
import type { PipelineObject } from '../lib/PipelineObject'

import { getPrompt } from '../lib/prompts'
import { safeStringifyJson } from '../common/json'

export class TestplanStage extends PipelineStage {
  constructor() {
    super('Testplan')
    this.process = this.process.bind(this)
  }

  public async process(input: PipelineObject): Promise<PipelineObject> {
    const generateTestplanPrompt = getPrompt('generateTestplan', {
      inputFunction: input.isolatedFunctionContents,
      language: input.lang,
      packageJson: safeStringifyJson(input.packageJsonContents)
    })
    const testplan = await input.sendHumanPrompt(generateTestplanPrompt)
    input.testplan = testplan
    return input
  }
}
