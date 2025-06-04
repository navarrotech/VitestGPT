// Copyright © 2025 Navarrotech

import { v7 as uuid } from 'uuid'

export class PipelineObject {
  public id: string = uuid()
  public continue: boolean = true

  public targetInputFile: string
  public targetInputFunction: string
  public targetOutputFile: string

  public targetRawInputFileContents: string
  public isolatedFunctionContents: string

  public testplan: string

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

  public log(...args: any[]): void {
    // TODO: Type this better
    // @ts-ignore
    logger.log(...args)
  }
}
