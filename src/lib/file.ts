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

export function forEachFileInDirectory(
  dirPath: string,
  callback: (filename: string, filePath: string, ext: string) => void,
  recursive: boolean = false
): void {
  const normalizedPath = path.resolve(dirPath)

  if (!fs.existsSync(normalizedPath)) {
    throw new Error(`Directory not found: ${normalizedPath}`)
  }

  const files = fs.readdirSync(normalizedPath)

  for (const file of files) {
    const filePath = path.join(normalizedPath, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory() && recursive) {
      forEachFileInDirectory(filePath, callback, true)
    }
    else if (stats.isFile()) {
      callback(
        path.basename(file, path.extname(file)),
        filePath,
        path.extname(file).toLowerCase()
      )
    }
  }
}

export function findPackageJson(fromPath: string): string {
  // Resolve the starting path to an absolute path
  let currentDir = path.resolve(fromPath)

  // Traverse upward until the filesystem root is reached
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Build the path to package.json in the current directory
    const pkgPath = path.join(currentDir, 'package.json')

    // Check if package.json exists and is a file
    if (fs.existsSync(pkgPath) && fs.statSync(pkgPath).isFile()) {
      return pkgPath
    }

    // Determine the parent directory
    const parentDir = path.dirname(currentDir)

    // If we've reached the filesystem root (parent equals current), stop searching
    if (parentDir === currentDir) {
      break
    }

    // Move up one level and continue searching
    currentDir = parentDir
  }

  // If no package.json was found in any parent, return an empty string
  return ''
}
