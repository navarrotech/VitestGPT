// Copyright © 2025 Navarrotech

/* eslint-disable import/no-extraneous-dependencies, import/no-default-export */

// !!! These are ONLY samples for testing with vitest, do not import in production code !!!

import axios from 'axios'
import { MAX_CACHE_SIZE } from './constants'
import {
  v4 as uuidv4
} from 'uuid'

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss'

const cache = new Map<string, any>()

type ReshapedResponse<Shape> = {
  results: Shape[]
  total: number
  page: number
  totalPages?: number
}

/**
 * Deeply clones an object or array, handling Dates, Arrays, and nested objects.
 * @param {obj} obj The object or array to clone
 * @return {obj} A deep clone of the input object or array
 */
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
}

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
}

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
}

export default function clamp(value: number, min: number, max: number): number {
  // Ensure value is not less than min and not greater than max
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}

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
}

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
}

export async function makeRequestWithUuid(url: string, data: any): Promise<any> {
  // Generate a unique identifier for this request
  const requestId = uuidv4()
  // Attach the UUID to the data payload
  const payload = { ...data, requestId }
  // Make a POST request using axios
  const response = await axios.post(url, payload)
  return response.data
}

export function randomCheck() {
  return null
}

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
}

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
    name: `Item ${startIndex + i + 1}`
  }))

  return {
    results,
    total: totalItems,
    page,
    totalPages
  } as ReshapedResponse<any>
}
