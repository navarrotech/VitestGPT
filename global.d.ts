// Copyright © 2025 Navarrotech

declare global {
  const logger: {
    info: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
    debug: (...args: any[]) => void
    log: (...args: any[]) => void
    to: (target: string, ...args: any[]) => void
  }
}

// turn this file into a module so TS picks up the “declare global”
// (otherwise it’s just a script and won’t augment the global scope)
export {}
