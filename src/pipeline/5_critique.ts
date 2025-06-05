// Copyright © 2025 Navarrotech

import { PipelineStage } from './PipelineStage'
import type { PipelineObject } from '../lib/PipelineObject'

export class CritiqueStage extends PipelineStage {
  constructor() {
    super('Critique')
    this.process = this.process.bind(this)
  }

  public async process(input: PipelineObject): Promise<PipelineObject> {
    return input
  }
}
