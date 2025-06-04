// Copyright © 2025 Navarrotech

import 'dotenv/config'

export const OPENAI_API_KEY = process.env.OPENAI_API_TOKEN || ''
export const NODE_ENV = process.env.NODE_ENV || 'development'

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set.')
}
