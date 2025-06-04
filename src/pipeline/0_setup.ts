// Copyright © 2025 Navarrotech

import { PipelineStage } from './PipelineStage'
import type { PipelineObject } from '../lib/PipelineObject'

import fs from 'fs'

export class SetupStage extends PipelineStage {
  constructor() {
    super('Setup')
    this.process = this.process.bind(this)
  }

  public async process(input: PipelineObject): Promise<PipelineObject> {
    // Read contents of the target input file
    input.targetRawInputFileContents = fs.readFileSync(input.targetInputFile, 'utf-8')
    fs.writeFileSync(input.targetOutputFile, '', { flag: 'w', encoding: 'utf-8' })

    return input
  }
}
