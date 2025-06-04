// Copyright © 2025 Navarrotech

// Core
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Typescript
import type { PipelineStage } from '../src/pipeline/PipelineStage'

// Node
import os from 'os'
import fs from 'fs'

// Lib to test
import {
  AnalysisStage,
  getFunctionContents,
  getFunctionGlobals,
  getAllImports,
  extractArgNames,
  stripComments,
  getAllGlobalVariables,
  analyzeFile
} from '../src/pipeline/1_analysis'

// Lib
import { PipelineObject } from '../src/lib/PipelineObject'
import { ensureFileExists } from '../src/lib/file'
import { mockConsole } from './common/mockConsole'
import { v7 as uuid } from 'uuid'

const COMMON_SAMPLE_PATH = ensureFileExists('tests/samples/common.ts', 'Common sample file not found')
const commonFileContents = fs.readFileSync(COMMON_SAMPLE_PATH, 'utf-8')

type Context = {
  object: PipelineObject
  stage: PipelineStage
  outputFilePath: string
}

describe('Analysis Stage', () => {
  beforeEach<Context>((ctx) => {
    ctx.outputFilePath = `${os.tmpdir()}/${uuid()}.test.ts`
    ctx.stage = new AnalysisStage()
    ctx.object = new PipelineObject(COMMON_SAMPLE_PATH, 'deepClone', ctx.outputFilePath)
    globalThis.logger = mockConsole()
  })

  afterEach<Context>((ctx) => {
    if (fs.existsSync(ctx.outputFilePath)) {
      fs.unlinkSync(ctx.outputFilePath)
    }
  })

  it<Context>('unit tests should be setup properly', (ctx) => {
    expect(COMMON_SAMPLE_PATH).toBeDefined()
    expect(ctx.outputFilePath).toBeDefined()
    expect(ctx.object).toBeDefined()
    expect(ctx.stage).toBeDefined()
    expect(ctx.object.targetInputFile).toBe(COMMON_SAMPLE_PATH)
    expect(ctx.object.targetOutputFile).toBe(ctx.outputFilePath)
  })

  it<Context>('run setup stage', async (context) => {
    // Before the test, ensure the stage hasn't done anything yet
    context.object.isolatedFunctionContents = ''
    context.object.targetRawInputFileContents = commonFileContents

    // Run the setup stage
    const result = await context.stage.run(context.object)

    expect(result).toBeDefined()
    expect(result.continue).toBe(true)
    expect(result.isolatedFunctionContents).toBeDefined()
    expect(result.isolatedFunctionContents).toContain('deepClone')
  })
})

describe('getFunctionContents', () => {
  it('deepClone', () => {
    const result = getFunctionContents(commonFileContents, 'deepClone')
    expect(result).toBe(`
export function deepClone<T>(obj: T): T {
  // If obj is null or not an object, return it directly
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const arrCopy = [] as any[]
    for (const item of obj) {
      // Recursively clone each element
      arrCopy.push(deepClone(item))
    }
    return arrCopy as any
  }

  // Handle Object
  const clonedObj = {} as any
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Recursively clone each property
      clonedObj[key] = deepClone((obj as any)[key])
    }
  }
  return clonedObj as T
}`.trim())
  })

  it('debounce', () => {
    const result = getFunctionContents(commonFileContents, 'debounce')
    expect(result).toBe(`
export function debounce<T extends(...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    // Clear previous timer if it exists
    if (timeout) {
      clearTimeout(timeout)
    }

    // Set a new timer to call the function after wait ms
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}`.trim())
  })

  it('formatDate', () => {
    const result = getFunctionContents(commonFileContents, 'formatDate')
    expect(result).toBe(`
export function formatDate(date: Date, format: string = DEFAULT_DATE_FORMAT): string {
  // Extract date parts
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  // Replace tokens in the format string
  let formatted = format
  formatted = formatted.replace('yyyy', year)
  formatted = formatted.replace('MM', month)
  formatted = formatted.replace('dd', day)
  formatted = formatted.replace('HH', hours)
  formatted = formatted.replace('mm', minutes)
  formatted = formatted.replace('ss', seconds)
  return formatted
}`.trim())
  })

  it('clamp', () => {
    const result = getFunctionContents(commonFileContents, 'clamp')
    expect(result).toBe(`
export default function clamp(value: number, min: number, max: number): number {
  // Ensure value is not less than min and not greater than max
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}`.trim())
  })

  it('retryAsync', () => {
    const result = getFunctionContents(commonFileContents, 'retryAsync')
    expect(result).toBe(`
export async function retryAsync<T>(
  // Function to retry, should return a Promise
  fn: () => Promise<T>,
  // Number of retries before giving up
  retries: number = 3,
  /* Time to delay in milliseconds */
  delayMs: number = 1000
): Promise<T> {
  try {
    // Attempt the function once
    return await fn()
  }
  catch (error) {
    // If no retries left, rethrow the error
    if (retries <= 0) {
      throw error
    }

    // Wait for delayMs before retrying
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    // Retry with one fewer retry count
    return retryAsync(fn, retries - 1, delayMs)
  }
}`.trim())
  })

  it('isShallowEqual', () => {
    const result = getFunctionContents(commonFileContents, 'isShallowEqual')
    expect(result).toBe(`
export function isShallowEqual(objA: any, objB: any): boolean {
  // If both are strictly equal, they are shallow equal
  if (objA === objB) {
    return true
  }

  // If either is null or not an object, they are not equal
  if (
    objA === null
    || objB === null
    || typeof objA !== 'object'
    || typeof objB !== 'object'
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  // If number of keys differ, not equal
  if (keysA.length !== keysB.length) {
    return false
  }

  // Check each key for equality
  for (const key of keysA) {
    if ((objA as any)[key] !== (objB as any)[key]) {
      return false
    }
  }
  return true
}`.trim())
  })

  it('makeRequestWithUuid', () => {
    const result = getFunctionContents(commonFileContents, 'makeRequestWithUuid')
    expect(result).toBe(`
export async function makeRequestWithUuid(url: string, data: any): Promise<any> {
  // Generate a unique identifier for this request
  const requestId = uuidv4()
  // Attach the UUID to the data payload
  const payload = { ...data, requestId }
  // Make a POST request using axios
  const response = await axios.post(url, payload)
  return response.data
}`.trim())
  })

  it('randomCheck', () => {
    const result = getFunctionContents(commonFileContents, 'randomCheck')
    expect(result).toBe(`
export function randomCheck() {
  return null
}`.trim())
  })

  it('simpleCacheStore', () => {
    const result = getFunctionContents(commonFileContents, 'simpleCacheStore')
    expect(result).toBe(`
export function simpleCacheStore(key: string, value?: any): any {
  // If value is provided, set it in the cache
  if (value !== undefined) {
    randomCheck()
    // If cache size exceeds max, delete the oldest entry
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    cache.set(key, value)
    return null
  }
  // If value is not provided, return the cached value or null
  return cache.has(key) ? cache.get(key) : null
}`.trim())
  })

  it('calculatePagination', () => {
    const result = getFunctionContents(commonFileContents, 'calculatePagination')
    expect(result).toBe(`
export function calculatePagination(
  totalItems: number,
  pageSize: number,
  currentPage: number
): ReshapedResponse<any> {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize)
  // Clamp current page to valid range
  const page = clamp(currentPage, 1, totalPages)

  // Calculate start and end indices for slicing items
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const results = Array.from({ length: endIndex - startIndex }, (_, i) => ({
    id: startIndex + i + 1, // Simulating item IDs
    name: \`Item \${startIndex + i + 1}\`
  }))

  return {
    results,
    total: totalItems,
    page,
    totalPages
  } as ReshapedResponse<any>
}`.trim())
  })
})

// describe('getFunctionGlobals', () => {
//   it('simpleCacheStore', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'simpleCacheStore')
//     const result = getFunctionGlobals(functionContents, commonFileContents, 'simpleCacheStore')
//     expect(result).toBe(`
// import { MAX_CACHE_SIZE} from './constants'
// const cache = new Map<string, any>()
// `.trim())
//   })
// })

describe('analyzeFile', () => {
  it('should properly analyze the common file', () => {
    const analysis = analyzeFile(commonFileContents)
    expect(analysis).toBeDefined()

    console.log(analysis.imports)
  })
})

describe('getAllImports', () => {
  it('should work with the common sample file with no side effects', () => {
    const result = getAllImports(commonFileContents)
    expect(result).toEqual([
      'import axios from \'axios\'',
      'import { MAX_CACHE_SIZE } from \'./constants\'',
      `import {
  v4 as uuidv4
} from 'uuid'`
    ])
  })

  it('import statements', () => {
    const sample = `
    import foo from "foo"
    import { Bar } from 'bar';
    import type { Baz } from "baz";
    import "./some-side-effect";
    `

    const result = getAllImports(sample)
    expect(result).toEqual([
      'import foo from "foo"',
      'import { Bar } from \'bar\';',
      'import type { Baz } from "baz";',
      'import "./some-side-effect";'
    ])
  })

  it('should work with require statements', () => {
    const sample = `
    const fs = require("fs");
    let foo = require('foo');
    var bar=require("bar");
    require("dotenv/config");
    require('source-map-support/register');
    `.trim()

    const result = getAllImports(sample)
    expect(result).toEqual([
      'const fs = require("fs");',
      'let foo = require(\'foo\');',
      'var bar=require("bar");',
      'require("dotenv/config");',
      'require(\'source-map-support/register\');'
    ])
  })
})

// describe('getAllGlobalVariables', () => {
//   it('should return all global variables used in the common sample file', () => {
//     const result = getAllGlobalVariables(commonFileContents)
//     expect(result).toEqual([
//       'const DEFAULT_DATE_FORMAT = \'yyyy-MM-dd HH:mm:ss\'',
//       'const cache = new Map<string, any>()',
//       `type ReshapedResponse<Shape> = {
//         results: Shape[]
//         total: number
//         page: number
//         totalPages?: number
//       }`
//     ])
//   })
// })

// describe('listAllGlobalsUsed', () => {
//   it('deepClone', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'deepClone')
//     const result = listAllGlobalsUsed(functionContents, 'deepClone')
//     expect(result).toBe([])
//   })

//   it('debounce', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'debounce')
//     const result = listAllGlobalsUsed(functionContents, 'debounce')
//     expect(result).toBe([])
//   })

//   it('formatDate', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'formatDate')
//     const result = listAllGlobalsUsed(functionContents, 'formatDate')
//     expect(result).toBe([ 'DEFAULT_DATE_FORMAT' ])
//   })

//   it('clamp', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'clamp')
//     const result = listAllGlobalsUsed(functionContents, 'clamp')
//     expect(result).toBe([])
//   })

//   it('retryAsync', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'retryAsync')
//     const result = listAllGlobalsUsed(functionContents, 'retryAsync')
//     expect(result).toBe([ 'retryAsync' ])
//   })

//   it('isShallowEqual', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'isShallowEqual')
//     const result = listAllGlobalsUsed(functionContents, 'isShallowEqual')
//     expect(result).toBe([])
//   })

//   it('makeRequestWithUuid', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'makeRequestWithUuid')
//     const result = listAllGlobalsUsed(functionContents, 'makeRequestWithUuid')
//     expect(result).toBe([ 'uuidv4', 'axios' ])
//   })

//   it('randomCheck', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'randomCheck')
//     const result = listAllGlobalsUsed(functionContents, 'randomCheck')
//     expect(result).toBe([])
//   })

//   it('calculatePagination', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'calculatePagination')
//     const result = listAllGlobalsUsed(functionContents, 'calculatePagination')
//     expect(result).toBe([ 'clamp' ])
//   })

//   it('simpleCacheStore', () => {
//     const functionContents = getFunctionContents(commonFileContents, 'simpleCacheStore')
//     const result = listAllGlobalsUsed(functionContents, 'simpleCacheStore')
//     expect(result).toEqual([
//       'cache',
//       'MAX_CACHE_SIZE',
//       'randomCheck'
//     ])
//   })
// })

describe('stripComments', () => {
  it('simpleCacheStore', () => {
    const functionContents = getFunctionContents(commonFileContents, 'simpleCacheStore')
    const result = stripComments(functionContents)
    expect(result).toBe(`
export function simpleCacheStore(key: string, value?: any): any {

  if (value !== undefined) {
    randomCheck()

    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    cache.set(key, value)
    return null
  }

  return cache.has(key) ? cache.get(key) : null
}`.trim())
  })
})

describe('extractArgNames', () => {
  it('deepClone', () => {
    const functionContents = getFunctionContents(commonFileContents, 'deepClone')
    const result = extractArgNames(functionContents)
    expect(result).toEqual([ 'obj' ])
  })

  it('debounce', () => {
    const functionContents = getFunctionContents(commonFileContents, 'debounce')
    const result = extractArgNames(functionContents)
    expect(result).toEqual([ 'func', 'wait' ])
  })

  it('formatDate', () => {
    const functionContents = getFunctionContents(commonFileContents, 'formatDate')
    const result = extractArgNames(functionContents)
    expect(result).toEqual([ 'date', 'format' ])
  })

  it('clamp', () => {
    const functionContents = getFunctionContents(commonFileContents, 'clamp')
    const result = extractArgNames(functionContents)
    expect(result).toEqual([ 'value', 'min', 'max' ])
  })

  it('retryAsync', () => {
    const functionContents = getFunctionContents(commonFileContents, 'retryAsync')
    const result = extractArgNames(functionContents)
    expect(result).toEqual([ 'fn', 'retries', 'delayMs' ])
  })

  it('isShallowEqual', () => {
    const functionContents = getFunctionContents(commonFileContents, 'isShallowEqual')
    const result = extractArgNames(functionContents)
    expect(result).toEqual([ 'objA', 'objB' ])
  })

  it('makeRequestWithUuid', () => {
    const functionContents = getFunctionContents(commonFileContents, 'makeRequestWithUuid')
    const result = extractArgNames(functionContents)
    expect(result).toEqual([ 'url', 'data' ])
  })

  it('randomCheck', () => {
    const functionContents = getFunctionContents(commonFileContents, 'randomCheck')
    const result = extractArgNames(functionContents)
    expect(result).toEqual([])
  })

  it('simpleCacheStore', () => {
    const functionContents = getFunctionContents(commonFileContents, 'simpleCacheStore')
    const result = extractArgNames(functionContents)
    expect(result).toEqual([ 'key', 'value' ])
  })

  it('calculatePagination', () => {
    const functionContents = getFunctionContents(commonFileContents, 'calculatePagination')
    const result = extractArgNames(functionContents)
    expect(result).toEqual([ 'totalItems', 'pageSize', 'currentPage' ])
  })
})
