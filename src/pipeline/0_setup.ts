// Copyright © 2025 Navarrotech

import { PipelineStage } from './PipelineStage'
import type { PipelineObject } from '../lib/PipelineObject'

// Utility
import { getBestVitestPath } from '../lib/vitest'
import { findPackageJson, makeRelativeImportPath } from '../lib/file'
import { safeParseJson } from '../common/json'
import fs from 'fs'

export class SetupStage extends PipelineStage {
  constructor() {
    super('Setup')
    this.process = this.process.bind(this)
  }

  public async process(input: PipelineObject): Promise<PipelineObject> {
    await getBestVitestPath()

    // Read contents of the target input file
    input.targetRawInputFileContents = fs.readFileSync(input.targetInputFile, 'utf-8')
    fs.writeFileSync(input.targetOutputFile, '', { flag: 'w', encoding: 'utf-8' })

    // Find the package.json file in the current directory or any parent directory
    const packageJsonPath = findPackageJson(input.targetInputFile)
    if (packageJsonPath) {
      logger.info('Reading package.json from:', packageJsonPath)
      input.packageJsonFile = packageJsonPath
      input.packageJsonContents = safeParseJson(
        fs.readFileSync(packageJsonPath, 'utf-8')
      )
    }
    else {
      input.packageJsonFile = null
      input.packageJsonContents = null
    }

    if (input.targetInputFile.toLowerCase().endsWith('.ts')) {
      input.lang = 'typescript'
    }
    else {
      input.lang = 'javascript'
    }

    input.relativeImportToTarget = makeRelativeImportPath(
      input.targetInputFile,
      input.targetOutputFile
    )

    return input
  }
}
