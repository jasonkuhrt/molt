import { environmentArgumentName } from '../src/environment.js'
import { Command } from '../src/index.js'
import { beforeEach, expect } from 'vitest'
import { describe, it } from 'vitest'
import { z } from 'zod'

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

const environmentManager = createEnvironmentManager()

beforeEach(environmentManager.reset)

describe(`toggling`, () => {
  it(`is enabled by default`, () => {
    environmentManager.set(`cli_parameter_foo`, `bar`)
    const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`can be enabled by settings`, () => {
    environmentManager.set(`cli_param_foo`, `bar`)
    const args = Command.create({ '--foo': z.string() })
      .settings({ readArgumentsFromEnvironment: true })
      .parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`can be enabled by environment`, () => {
    environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `true`)
    environmentManager.set(`cli_param_foo`, `bar`)
    const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`can be disabled by environment`, () => {
    environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `false`)
    environmentManager.set(`cli_param_foo`, `bar`)
    const args = Command.create({ '--foo': z.string().default(`x`) }).parseOrThrow([])
    expect(args).toEqual({ foo: `x` })
  })
  it(`environment supersedes settings`, () => {
    environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `false`)
    environmentManager.set(`cli_foo`, `bar`)
    expect(() =>
      Command.create({ '--foo': z.string() })
        .settings({ readArgumentsFromEnvironment: true })
        .parseOrThrow([])
    ).toThrow()
  })
})

describe(`default environment argument parameter name prefix`, () => {
  beforeEach(() => environmentManager.set(`CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT`, `true`))

  it(`argument can be passed by CLI_PARAMETER prefix`, () => {
    environmentManager.set(`cli_parameter_foo`, `bar`)
    const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`argument can be passed by CLI_PARAM prefix`, () => {
    environmentManager.set(`cli_param_foo`, `bar`)
    const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`when both argument CLI_PARAM and CLI_PARAMETER are passed then an error is thrown`, () => {
    environmentManager.set(`cli_param_foo`, `bar1`)
    environmentManager.set(`cli_parameter_foo`, `bar2`)
    expect(() => Command.create({ '--foo': z.string() }).parseOrThrow([])).toThrowErrorMatchingInlineSnapshot(
      `"Multiple environment variables found for same parameter \\"foo\\": [object Object], [object Object]"`
    )
  })
})

describe(`when enabled and a flag arg is not passed then the env is considered`, () => {
  beforeEach(() => environmentManager.set(`CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT`, `true`))

  describe(`boolean`, () => {
    it(`true`, () => {
      environmentManager.set(environmentArgumentName(`VERBOSE`), `true`)
      const args = Command.create({ '--verbose': z.boolean() }).parseOrThrow([])
      expect(args).toEqual({ verbose: true })
    })
    it(`true (with param default false)`, () => {
      environmentManager.set(environmentArgumentName(`VERBOSE`), `true`)
      const args = Command.create({ '--verbose': z.boolean().default(false) }).parseOrThrow([])
      expect(args).toEqual({ verbose: true })
    })
    it(`false`, () => {
      environmentManager.set(environmentArgumentName(`verbose`), `false`)
      const args = Command.create({ '--verbose': z.boolean() }).parseOrThrow([])
      expect(args).toEqual({ verbose: false })
    })
  })

  it(`string`, () => {
    environmentManager.set(environmentArgumentName(`foo`), `bar`)
    const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`number`, () => {
    environmentManager.set(environmentArgumentName(`foo`), `4.3`)
    const args = Command.create({ '--foo': z.number() }).parseOrThrow([])
    expect(args).toEqual({ foo: 4.3 })
  })
  it(`env arg is validated`, () => {
    environmentManager.set(environmentArgumentName(`foo`), `d`)
    expect(() => Command.create({ '--foo': z.enum([`a`, `b`, `c`]) }).parseOrThrow([]))
      .toThrowErrorMatchingInlineSnapshot(`
        "Invalid argument (via environment variable \\"CLI_PARAMETER_FOO\\") for parameter: \\"foo\\". The error was:
        Invalid enum value. Expected 'a' | 'b' | 'c', received 'd'"
      `)
  })
  it(`case of env name does not matter`, () => {
    environmentManager.set(`cLi_PARAM_fOo`, `bar`)
    const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
})

// it(`if environment args enabled, parameter has default, flag arg not given, but env arg given, then env arg wins`, () => {
//   environmentManager.set(`CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT`, `true`)
//   process.env[`cli_verbose`] = `true`
//   const args = Command.create({ '--verbose': z.boolean().default(false) }).parseOrThrow([])
//   expect(args).toEqual({ verbose: true })
// })
