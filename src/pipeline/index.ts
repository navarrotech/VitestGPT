// Copyright © 2025 Navarrotech

import { PipelineObject } from '../lib/PipelineObject'

import { SetupStage } from './0_setup'
import { AnalysisStage } from './1_analysis'
import { TestplanStage } from './2_testplan'
import { WriteStage } from './3_write'
import { TestStage } from './4_test'
import { ImproveStage } from './5_improve'
import { FinishStage } from './6_finish'

const setupStage = new SetupStage()
const analysisStage = new AnalysisStage()
const testplanStage = new TestplanStage()
const writeStage = new WriteStage()
const testStage = new TestStage()
const improveStage = new ImproveStage()
const finishStage = new FinishStage()

setupStage.setNext(analysisStage)
analysisStage.setNext(testplanStage)
testplanStage.setNext(writeStage)
writeStage.setNext(testStage)
testStage.setNext(improveStage)
improveStage.setNext(finishStage)

export function executePipeline(input: PipelineObject): Promise<PipelineObject> {
  return setupStage.run(input)
}
