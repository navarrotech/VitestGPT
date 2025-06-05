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
    return
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

/**
 * Ensures that all parent directories of the given file path exist,
 * then writes the provided contents to the file.
 *
 * @param {string} filePath - Path to the file to write
 * @param {string | Buffer} contents - Data to write to the file (string or Buffer)
 */
export function touch(filePath: string, contents: string | Buffer): void {
  const dir: string = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, contents)
}

/**
 * Generates a relative import path from one file to another
 *
 * @param {string} pathToImport - Absolute path of the file you want to import (including extension)
 * @param {string} sourcePath - Absolute path of the file where the import will live (including extension)
 * @return {string} A relative path suitable for a TypeScript import, with forward slashes
 */
export function makeRelativeImportPath(pathToImport: string, sourcePath: string): string {
  // 1. Normalize both inputs so e.g. "E:\Dir\..\Foo" → "E:\Foo"
  const normalizedImport = path.normalize(pathToImport)
  const normalizedSource = path.normalize(sourcePath)

  // 2. If both are on Windows with a drive letter (e.g. "E:\"), strip that off,
  //    so path.relative can compute a “pure” relative path. If there’s no drive,
  //    stripDrive just returns the original string.
  function stripDrive(p: string): string {
    // path.parse(p).root === "E:\" on Windows when p = "E:\Whatever\…"
    const parsed = path.parse(p)
    if (/^[A-Za-z]:[\\/]$/.test(parsed.root)) {
      // Remove the leading "E:\" (i.e. parsed.root.length characters)
      return p.slice(parsed.root.length)
    }
    return p
  }

  const importNoDrive = stripDrive(normalizedImport)
  const sourceNoDrive = stripDrive(normalizedSource)

  // 3. Grab the directory of the “source file” (without drive)
  const fromDirNoDrive = path.dirname(sourceNoDrive)

  // 4. Compute the raw relative path (still using backslashes on Windows)
  let relativePath = path.relative(fromDirNoDrive, importNoDrive)

  // 5. Convert backslashes → forward slashes
  relativePath = relativePath.replace(/\\/g, '/')

  // 6. If path.relative somehow returned a leading "./" (rare), strip it
  //    so we don’t end up with "././foo.ts"
  relativePath = relativePath.replace(/^\.\//, '')

  // 7. If it still doesn’t start with "." (i.e. it's in the same folder
  //    or a sub‐folder), prefix "./" to make it a valid import
  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`
  }

  return relativePath
}

// Asynchronously watch a file until the callback returns true
export async function watchFileUntil(
  filePath: string,
  callback: (fileContent: string) => boolean
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Create a watcher on the specified file path
    const watcher: fs.FSWatcher = fs.watch(filePath, (eventType, filename) => {
      try {
        // Invoke the callback; if it returns true, close watcher and resolve
        if (callback(fs.readFileSync(filePath, 'utf-8'))) {
          watcher.close()
          resolve()
        }
      }
      catch (error) {
        // On callback error, close watcher and reject the promise
        watcher.close()
        reject(error)
      }
    })

    // Handle watcher errors by closing and rejecting
    watcher.on('error', (error) => {
      watcher.close()
      reject(error)
    })
  })
}
