import { beforeEach } from 'vitest'

const createEnvironmentManager = () => {
  let changes: Record<string, string | undefined> = {}

  function set(environment: Record<string, string>): void
  function set(key: string, value: string): void
  //eslint-disable-next-line
  function set(...args: [key: string, value: string] | [Record<string, string>]): void {
    if (args.length === 1) {
      const [environment] = args
      Object.entries(environment).forEach(([key, value]) => {
        changes[key] = value
        process.env[key] = value
      })
    } else {
      const [key, value] = args
      changes[key] = value
      process.env[key] = value
    }
  }

  const reset = () => {
    Object.keys(changes).forEach((key) => {
      delete process.env[key]
    })
    changes = {}
  }

  return {
    set,
    reset,
  }
}

export const environmentManager = createEnvironmentManager()

beforeEach(environmentManager.reset)
