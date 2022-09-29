import { beforeEach } from 'vitest'

const createEnvironmentManager = () => {
  let changes: Record<string, string | undefined> = {}
  return {
    set: (key: string, value: string) => {
      changes[key] = value
      process.env[key] = value
    },
    reset: () => {
      Object.keys(changes).forEach((key) => {
        delete process.env[key]
      })
      changes = {}
    },
  }
}

export const environmentManager = createEnvironmentManager()

beforeEach(environmentManager.reset)
