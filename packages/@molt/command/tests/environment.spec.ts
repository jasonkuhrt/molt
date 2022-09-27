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
      .settings({ environmentArguments: true })
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
      Command.create({ '--foo': z.string() }).settings({ environmentArguments: true }).parseOrThrow([])
    ).toThrow()
  })
})

describe(`prefix`, () => {
  it(`can be disabled`, () => {
    environmentManager.set(`foo`, `bar`)
    const args = Command.create({ '--foo': z.string() })
      .settings({ environmentArguments: { prefix: null } })
      .parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`can be customized to a different prefix`, () => {
    environmentManager.set(`FOO_foo`, `bar`)
    const args = Command.create({ '--foo': z.string() })
      .settings({ environmentArguments: { prefix: `FOO` } })
      .parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`can be customized to multiple accepted different prefixes`, () => {
    environmentManager.set(`FOO_foo`, `qux1`)
    environmentManager.set(`BAR_bar`, `qux2`)
    const args = Command.create({ '--foo': z.string(), '--bar': z.string() })
      .settings({ environmentArguments: { prefix: [`FOO`, `BAR`] } })
      .parseOrThrow([])
    expect(args).toEqual({ foo: `qux1`, bar: `qux2` })
  })
  it(`defaults to CLI_PARAM or CLI_PARAMETERS`, () => {
    environmentManager.set(`cli_param_foo`, `qux1`)
    environmentManager.set(`cli_parameter_bar`, `qux2`)
    const args = Command.create({ '--foo': z.string(), '--bar': z.string() }).parseOrThrow([])
    expect(args).toEqual({ foo: `qux1`, bar: `qux2` })
  })
  describe(`error`, () => {
    it(`when using prefix and there is a typo`, () => {
      environmentManager.set(`cli_param_bar`, `qux1`)
      // TODO show not just envar prefix in error message json
      expect(() =>
        Command.create({ '--foo': z.string() }).parseOrThrow([])
      ).toThrowErrorMatchingInlineSnapshot(
        `
        "Environment variables appearing to be CLI parameter arguments were found but do not correspond to any actual parameters. This probably indicates a typo or some other kind of error: {
          \\"bar\\": {
            \\"CLI_PARAM\\": \\"qux1\\"
          }
        }"
      `
      )
    })
    it(`when using multiple prefixes and args passed for all param variations`, () => {
      environmentManager.set(`cli_param_bar`, `qux1`)
      environmentManager.set(`cli_parameter_bar`, `qux2`)
      environmentManager.set(`cli_param_foo`, `qux1`)
      environmentManager.set(`cli_parameter_foo`, `qux2`)
      // TODO show not just envar prefix in error message json
      expect(() =>
        Command.create({ '--foo': z.string(), '--bar': z.string() }).parseOrThrow([])
      ).toThrowErrorMatchingInlineSnapshot(
        `
        "Parameter(s) \\"foo\\", \\"bar\\" received arguments multiple times via different environment variables: {
          \\"bar\\": {
            \\"CLI_PARAM\\": \\"qux1\\",
            \\"CLI_PARAMETER\\": \\"qux2\\"
          },
          \\"foo\\": {
            \\"CLI_PARAM\\": \\"qux1\\",
            \\"CLI_PARAMETER\\": \\"qux2\\"
          }
        }"
      `
      )
    })
    it.todo(`when argument collision and typo then both errors are shown`)
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
      `
      "Parameter(s) \\"foo\\" received arguments multiple times via different environment variables: {
        \\"foo\\": {
          \\"CLI_PARAM\\": \\"bar1\\",
          \\"CLI_PARAMETER\\": \\"bar2\\"
        }
      }"
    `
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
