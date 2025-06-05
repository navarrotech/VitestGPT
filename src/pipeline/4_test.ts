// Copyright © 2025 Navarrotech

import { PipelineStage } from './PipelineStage'
import type { PipelineObject } from '../lib/PipelineObject'

import { runVitest } from '../lib/vitest'

export class TestStage extends PipelineStage {
  constructor() {
    super('Test')
    this.process = this.process.bind(this)
  }

  public async process(input: PipelineObject): Promise<PipelineObject> {
    const [ result, exitCode ] = await runVitest(
      input.targetOutputFile
    )

    console.log({ result, exitCode })

    return input
  }
}
