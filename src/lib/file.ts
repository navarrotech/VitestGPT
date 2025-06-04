// Copyright © 2025 Navarrotech

import path from 'path'
import fs from 'fs'

export function ensureFileExists(filePath: string, errorMessage: string): string {
  if (!filePath) {
    throw new Error(errorMessage)
  }

  // Normalize the file path to ensure it is absolute
  const normalizedPath = path.resolve(filePath)

  // Check if the file exists
  if (!fs.existsSync(normalizedPath)) {
    throw new Error(`File not found: ${normalizedPath}`)
  }

  return normalizedPath
}
