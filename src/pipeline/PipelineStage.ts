// Copyright © 2025 Navarrotech

import { PipelineObject } from '../lib/PipelineObject'

export class PipelineStage {
  next: PipelineStage | null = null

  name: string

  static stages = new Map<number, PipelineStage>()

  constructor(name: string) {
    this.name = name

    PipelineStage.stages.set(PipelineStage.stages.size, this)

    this.beforeRun = this.beforeRun.bind(this)
    this.afterRun = this.afterRun.bind(this)
    this.run = this.run.bind(this)
    this.process = this.process.bind(this)
  }

  private async beforeRun(input: PipelineObject): Promise<PipelineObject> {
    return input
  }

  private async afterRun(input: PipelineObject): Promise<PipelineObject> {
    return input
  }

  public async run(input: PipelineObject): Promise<PipelineObject> {
    if (!input.continue) {
      // Handle aborting early
      return input
    }

    input = await this.beforeRun(input)
    try {
      input.log(`Entering ${this.name} stage`)
      input = await this.process(input)
    }
    catch (error: unknown) {
      input.continue = false
      input.log(`Error in stage "${this.name}":`, error)
      logger.error(error)
    }
    input = await this.afterRun(input)

    if (this.next) {
      return await this.next.run(input)
    }

    return input
  }

  public setNext(stage: PipelineStage): PipelineStage {
    this.next = stage
    return stage
  }

  // @abstract
  public async process(input: PipelineObject): Promise<PipelineObject> {
    return input
  }
}
