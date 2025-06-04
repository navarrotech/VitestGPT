// Copyright © 2025 Navarrotech

import { executePipeline } from './pipeline'
import { PipelineObject } from './lib/PipelineObject'

export async function main(inputPath: string, functionName: string, outputPath: string) {
  const input = new PipelineObject(inputPath, functionName, outputPath)
  try {
    return await executePipeline(input)
  }
  catch (error) {
    logger.error('Pipeline execution failed:', error)
    process.exit(1)
    return null
  }
}
