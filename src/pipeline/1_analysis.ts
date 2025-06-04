// Copyright © 2025 Navarrotech

import { PipelineStage } from './PipelineStage'
import type { PipelineObject } from '../lib/PipelineObject'

export class AnalysisStage extends PipelineStage {
  constructor() {
    super('Analysis')
    this.process = this.process.bind(this)
  }

  public async process(input: PipelineObject): Promise<PipelineObject> {
    input.isolatedFunctionContents = getFunctionContents(
      input.targetRawInputFileContents,
      input.targetInputFunction
    )

    if (!input.isolatedFunctionContents?.length) {
      input.log(`Function "${input.targetInputFunction}" not found in file "${input.targetInputFile}".`)
      input.continue = false
      return input
    }

    return input
  }
}

type TsAnalysis = {
  functions: Record<string, {
    name: string
    globalsUsed: string[] // List of global variables/functions/objects used in the function
    args: Record<string, string | undefined> // Args by name & type
    returnType: string | undefined // Return type of the function
    generics: string
    jsDoc: string // JSDoc comment for the function
    raw: string // The complete function declaration and body as a string
  }>
  classes: Record<string, {
    name: string
    globalsUsed: string[] // List of global variables/functions/objects used in the class
    generics: string // Generic types used in the class
    raw: string // The complete class declaration
  }>
  imports: {
    module: string
    items: string[]
    type: 'import' | 'require' // Type of import
    isDefault: boolean // Whether this is a default import
    raw: string
  }[]
  globals: {
    name: string
    value: string // Value of the global variable
    type: 'let' | 'const' | 'var' | 'type' | 'interface'
    raw: string
  }[]
}
export function analyzeFile(rawFileContents: string): TsAnalysis {
  const analysis: TsAnalysis = {
    functions: {},
    classes: {},
    imports: [],
    globals: []
  }

  rawFileContents = rawFileContents.replace(/\r\n/g, '\n').trim() // Normalize line endings

  const lines = rawFileContents.split('\n')

  function scanNextLinesUntil(condition: (line: string) => boolean, startIndex: number): string {
    let result = ''
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (condition(line)) {
        break
      }
      result += line + '\n'
    }
    return result.trim()
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    line = line.trim()
    if (line.startsWith('//')) {
      // Skip single-line comments
      continue
    }

    // if (line.startsWith('/*') && line.endsWith('*/')) {
    //   // Skip multi-line comments
    //   continue
    // }

    if (line.startsWith('import {\n')) {
      // Handle named imports
      const importMatch = line.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/)
      if (importMatch) {
        const [ , namedImports, module ] = importMatch
        const items = namedImports.split(',').map((item) => item.trim())
        analysis.imports.push({
          module,
          items,
          type: 'import',
          isDefault: false,
          raw: line
        })
      }
    }
    else if (line.startsWith('import {')) {
      const importMatch = line.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/)
      if (importMatch) {
        const [ , namedImports, module ] = importMatch
        const items = namedImports.split(',').map((item) => item.trim())
        analysis.imports.push({
          module,
          items,
          type: 'import',
          isDefault: false,
          raw: line
        })
      }
    }
    else if (line.startsWith('import')) {
      // Match import statements
      const importMatch = line.match(/import\s+(?:(\w+)\s*,\s*)?(?:(\w+)\s+from\s+)?['"]([^'"]+)['"]/)
      if (importMatch) {
        const [ , namedImport, defaultImport, module ] = importMatch
        analysis.imports.push({
          module,
          items: namedImport ? [ namedImport ] : [],
          type: 'import',
          isDefault: !!defaultImport,
          raw: line
        })
      }
    }
    else if (line.startsWith('require(')) {
      // Match require statements
      const requireMatch = line.match(/require\(\s*['"]([^'"]+)['"]\s*\)/)
      if (requireMatch) {
        const [ , module ] = requireMatch
        analysis.imports.push({
          module,
          items: [],
          type: 'require',
          isDefault: false,
          raw: line
        })
      }
    }
  }


  return analysis
}

/**
 * Extracts the complete source code of an exported function from the given file contents.
 *
 * This function looks for an exported function declaration matching one of:
 *   - `export function functionName(...)`
 *   - `export async function functionName(...)`
 *   - `export default function functionName(...)`
 *   - `export default async function functionName(...)`
 *
 * It also handles optional generics after the function name (e.g., `<T extends ...>`)
 * and an optional return type annotation before the opening `{`. Once the signature
 * is found, it walks through the braces to return the entire function body, including
 * nested blocks. If no matching function or closing brace is found, an empty string is returned.
 *
 * @param {string} fileContents - The full text of the file in which to search
 * @param {string} functionName - The exact name of the exported function to extract
 * @return {string} The substring containing the entire function declaration and body,
 *                   or an empty string if the function is not found or is malformed
 */
export function getFunctionContents(fileContents: string, functionName: string): string {
  // Regex matches:
  //   - "export function functionName("
  //   - "export async function functionName("
  //   - "export default function functionName("
  //   - "export default async function functionName("
  //   - optional generics after functionName, e.g. "<T extends ...>"
  //   - optional return type annotation before the opening "{"
  const regex = new RegExp(
    `export\\s+(?:default\\s+)?(?:async\\s+)?function\\s+${functionName}(?:<[\\s\\S]*?>)?\\s*\\(`
  )
  const match = regex.exec(fileContents)
  if (!match) {
    return ''
  }

  const startIndex = match.index

  // Find the first "{" after the function signature (which may include a return type)
  const braceStart = fileContents.indexOf('{', match.index)
  if (braceStart === -1) {
    return ''
  }

  // Walk forward from that "{", tracking nested braces until they all close
  let depth = 0
  let currentIndex = braceStart
  const length = fileContents.length

  while (currentIndex < length) {
    const char = fileContents[currentIndex]
    if (char === '{') {
      depth++
    }
    else if (char === '}') {
      depth--
      if (depth === 0) {
        // Include the closing "}" in the returned substring
        const endIndex = currentIndex + 1
        return fileContents.slice(startIndex, endIndex)
      }
    }
    currentIndex++
  }

  // If no matching closing brace was found, return empty string
  return ''
}

// const extractImportRegex =
export function getFunctionGlobals(
  functionContents: string,
  fileContents: string,
  functionName: string
): string {
  // Grab all import lines
  const importLines = getAllImports(fileContents)

  // Grab all global constant lines
  const globalVariables = getAllGlobalVariables(fileContents)

  return `
${importLines.join('\n')}

${globalVariables.join('\n')}

// Function: ${functionName}
${functionContents.trim()}
  `.trim()
}

const importFromRegex = /^\s*import(?:\s+type)?[\s\S]*?from\s+['"][^'"]+['"]\s*;?$/gm
const importDirectRegex = /^\s*import\s+['"][^'"]+['"]\s*;?$/gm
const requireAssignmentRegex = /^\s*(?:const|let|var)\s+\w+\s*=\s*require\(\s*['"][^'"]+['"]\s*\)\s*;?$/gm
const requireDirectRegex = /^\s*require\(\s*['"][^'"]+['"]\s*\)\s*;?$/gm
export function getAllImports(fileContents: string): string[] {
  const results = new Set<string>()

  // 1) ESM “import … from '…'” (single- or multi-line)
  for (const match of fileContents.matchAll(importFromRegex)) {
    const importLine = match[0].trim()
    if (importLine && !results.has(importLine)) {
      results.add(importLine)
    }
  }

  // 2) ESM “import '…'” (side-effect only)
  for (const match of fileContents.matchAll(importDirectRegex)) {
    const importLine = match[0].trim()
    if (importLine && !results.has(importLine)) {
      results.add(importLine)
    }
  }

  // 3) CommonJS “const/let/var x = require('…');”
  for (const match of fileContents.matchAll(requireAssignmentRegex)) {
    const requireLine = match[0].trim()
    if (requireLine && !results.has(requireLine)) {
      results.add(requireLine)
    }
  }

  // 4) CommonJS bare “require('…');”
  for (const match of fileContents.matchAll(requireDirectRegex)) {
    const requireLine = match[0].trim()
    if (requireLine && !results.has(requireLine)) {
      results.add(requireLine)
    }
  }

  return Array.from(results)
}

// const getAllGlobalVariablesRegex = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?:=|:)/g
// const getAllGlobalTypeDefsRegex = /(?:type|interface)\s+([A-Za-z_$][\w$]*)/g
export function getAllGlobalVariables(fileContents: string): string[] {
  const results = new Set<string>()

  const stripped = stripComments(fileContents)

  for (const line of stripped.split('\n')) {
    const trimmedLine = line.trim()
  }

  return Array.from(results).sort((a, b) => a.localeCompare(b))
}

// const extractGlobalFunctionsRegex = /(?<!\.)\b(\w+)\(/g
// const extractVariablesRegex = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?:=|:)/g
// const extractGlobalWords = /(?<=[ =<>!])([A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*)(?=[)\s])/g
// const extractGlobalObjectCalls = /(\w*)\./g
// export function listAllGlobalsUsed(functionContents: string, functionName: string): string[] {
//   const results = new Set<string>()
//   const strippedContents = stripComments(functionContents)
//   const argNames = extractArgNames(strippedContents)

//   // Find all global functions
//   const functionMatches = functionContents.matchAll(extractGlobalFunctionsRegex)
//   for (const match of functionMatches) {
//     const globalFunction = match[1]
//     if (globalFunction !== functionName && !results.has(globalFunction)) {
//       results.add(globalFunction)
//     }
//   }

//   // Find all locally defined variables
//   const variables = new Set<string>()
//   const variableMatches = strippedContents.matchAll(extractVariablesRegex)
//   for (const match of variableMatches) {
//     const variableName = match[1]
//     if (variableName
//       && !argNames.includes(variableName)
//       && !results.has(variableName)
//       && !reservedKeywords.includes(variableName)
//       && !unnecessaryGlobalProperties.includes(variableName)
//     ) {
//       variables.add(variableName)
//     }
//   }

//   // Find all global variables
//   const objectMatches = strippedContents.matchAll(extractGlobalWords)
//   for (const match of objectMatches) {
//     const globalObject = match[1]
//     if (
//       globalObject
//       && !argNames.includes(globalObject)
//       && !results.has(globalObject)
//       && !reservedKeywords.includes(globalObject)
//       && !variables.has(globalObject) // Exclude locally defined variables
//       && !unnecessaryGlobalProperties.includes(globalObject)
//     ) {
//       results.add(globalObject)
//     }
//   }

//   // Find all object method calls
//   const objectCallMatches = strippedContents.matchAll(extractGlobalObjectCalls)
//   for (const match of objectCallMatches) {
//     const globalObjectCall = match[1]
//     if (
//       globalObjectCall
//       && !argNames.includes(globalObjectCall)
//       && !results.has(globalObjectCall)
//       && !reservedKeywords.includes(globalObjectCall)
//       && !variables.has(globalObjectCall) // Exclude locally defined variables
//       && !unnecessaryGlobalProperties.includes(globalObjectCall)
//     ) {
//       results.add(globalObjectCall)
//     }
//   }

//   return Array.from(results).sort((a, b) => a.localeCompare(b))
// }

export function stripComments(functionContents: string): string {
  // Remove single-line comments
  let strippedContents = functionContents.replace(/^\s*\/\/.*$/gm, '')
  // Remove multi-line comments
  strippedContents = strippedContents.replace(/\/\*[\s\S]*?\*\//g, '')
  // Remove trailing whitespace
  strippedContents = strippedContents.trim()
  return strippedContents
}


const extractArgNamesRegex: RegExp = /(\w*)[:|?]/gm
const removeTypescriptGenerics: RegExp = /(<[\s\S]*?(?<!=)>)/g
export function extractArgNames(functionContents: string): string[] {
  const argNames = new Set<string>()

  let paranthesisCount = 0

  let trimmedContents = stripComments(functionContents)
    .replace(removeTypescriptGenerics, '')

  trimmedContents = trimmedContents
    .slice(trimmedContents.indexOf('(') + 1)
    .trim()

  let endIndex = 0
  for (let i = 0; i < trimmedContents.length; i++) {
    const char = trimmedContents[i]
    if (char === '(') {
      paranthesisCount++
    }
    else if (char === ')') {
      paranthesisCount--
      if (paranthesisCount < 0) {
        endIndex = i
        break // Unmatched closing parenthesis, exit loop
      }
    }
  }

  trimmedContents = trimmedContents
    .slice(0, endIndex)
    .replaceAll(/\n/g, ' ')
    .replaceAll(/\r/g, ' ')
    .trim()

  if (trimmedContents.length === 0) {
    return []
  }

  const argMatches = trimmedContents.matchAll(extractArgNamesRegex)
  for (const match of argMatches) {
    const argName = match[1].trim()
    if (argName && !argNames.has(argName)) {
      argNames.add(argName)
    }
  }

  return Array.from(argNames)
}
