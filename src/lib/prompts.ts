// Copyright © 2025 Navarrotech

// Core
import { render } from 'squirrelly'

// File
import { forEachFileInDirectory } from './file'
import { readFileSync } from 'fs'
import { resolve } from 'path'

type availablePrompts =
  | 'systemPrompt'
  | 'generateTestplan'
  | 'writeUnitTests'

const templates: Record<string, string> = {}

const TEMPLATES_DIR = resolve(process.cwd(), 'src/prompts')
forEachFileInDirectory(TEMPLATES_DIR, (filename, filePath, ext) => {
  if (ext != '.md') {
    return
  }
  const content = readFileSync(filePath, 'utf-8')
  templates[filename] = content
}, true)

export function getPrompt(name: availablePrompts, data: Record<string, any> = {}): string {
  if (!templates[name]) {
    throw new Error(`Prompt template not found: ${name}`)
  }

  const template = templates[name]
  return render(template, data)
}
