// Copyright © 2025 Navarrotech

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/vitest.setup.ts'],
    reporters: 'verbose',
    globals: true,
    environment: 'node',
  },
})
