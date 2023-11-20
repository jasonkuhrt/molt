import { beforeEach } from 'vitest'

export const createState = <X, Value = string>(params?: {
  value?: (values: X[]) => Value
}): { set: (value: X) => X[]; values: X[]; value: Value } => {
  let values: X[] = []

  beforeEach(() => {
    values = []
  })

  return {
    get values(): X[] {
      return values
    },
    get value(): Value {
      return params?.value?.(values) ?? (values.join(``) as Value)
    },
    set: (newValue: X): X[] => {
      values.push(newValue)
      return values
    },
  }
}

const createEnvironmentManager = () => {
  let changes: Record<string, string | undefined> = {}

  function set(environment: Record<string, string>): void
  function set(key: string, value: string): void
  // eslint-disable-next-line
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
