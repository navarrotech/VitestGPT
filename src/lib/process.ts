// Copyright © 2025 Navarrotech

// Core
import { spawn, SpawnOptions } from 'child_process'

/**
 * Spawns a child process asynchronously and returns its combined stdout and stderr output.
 *
 * @param {string} command - The command to execute
 * @param {string[]} args - An array of string arguments to pass to the command (defaults to an empty array)
 * @param {SpawnOptions} options - Spawn options as defined by Node’s SpawnOptions (defaults to an empty object)
 * @return {Promise<string>} A Promise that resolves with the combined stdout and stderr text once the process exits
 * @throws {Error} If the process fails to spawn, the promise is rejected with the spawn error
 */
export async function runCommand(
  command: string,
  args: string[] = [],
  options: SpawnOptions = {}
): Promise<[string, number]> {
  return new Promise<[string, number]>((resolve, reject) => {
    // Start the child process
    const child = spawn(command, args, options)

    let output = ''

    // Collect stdout data
    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        output += chunk.toString()
      })
    }

    // Collect stderr data
    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        output += chunk.toString()
      })
    }

    // Handle errors from spawning
    child.on('error', (err) => {
      reject(err)
    })

    // Resolve when the process exits (regardless of exit code)
    child.on('close', () => {
      resolve([ output, child.exitCode ?? 0 ])
    })
  })
}
