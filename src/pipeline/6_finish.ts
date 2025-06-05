// Copyright © 2025 Navarrotech

import { PipelineStage } from './PipelineStage'
import type { PipelineObject } from '../lib/PipelineObject'

export class FinishStage extends PipelineStage {
  constructor() {
    super('Finish')
    this.process = this.process.bind(this)
  }

  public async process(input: PipelineObject): Promise<PipelineObject> {
    logger.info(
      JSON.stringify({
        message: 'Pipeline execution completed successfully',
        input
      }, null, 2)
    )
    return input
  }
}
