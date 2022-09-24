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
  it(`is disabled by default`, () => {
    environmentManager.set(`cli_foo`, `bar`)
    expect(() => Command.create({ '--foo': z.string() }).parseOrThrow([])).toThrow()
  })
  it(`can be enabled by settings`, () => {
    environmentManager.set(`cli_foo`, `bar`)
    const args = Command.create({ '--foo': z.string() })
      .settings({ readArgumentsFromEnvironment: true })
      .parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`can be enabled by environment`, () => {
    environmentManager.set(`cli_environment_args`, `true`)
    environmentManager.set(`cli_foo`, `bar`)
    const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`environment supersedes settings`, () => {
    environmentManager.set(`cli_environment_args`, `false`)
    environmentManager.set(`cli_foo`, `bar`)
    expect(() =>
      Command.create({ '--foo': z.string() })
        .settings({ readArgumentsFromEnvironment: true })
        .parseOrThrow([])
    ).toThrow()
  })
})

describe(`when enabled and a flag arg is not passed then the env is considered`, () => {
  beforeEach(() => environmentManager.set(`CLI_ENV_ARGS`, `true`))

  describe(`boolean`, () => {
    it(`true`, () => {
      environmentManager.set(`cli_VERBOSE`, `true`)
      const args = Command.create({ '--verbose': z.boolean() }).parseOrThrow([])
      expect(args).toEqual({ verbose: true })
    })
    it(`true (with param default false)`, () => {
      environmentManager.set(`cli_VERBOSE`, `true`)
      const args = Command.create({ '--verbose': z.boolean().default(false) }).parseOrThrow([])
      expect(args).toEqual({ verbose: true })
    })
    it(`false`, () => {
      environmentManager.set(`cli_verbose`, `false`)
      const args = Command.create({ '--verbose': z.boolean() }).parseOrThrow([])
      expect(args).toEqual({ verbose: false })
    })
  })

  it(`string`, () => {
    environmentManager.set(`cli_foo`, `bar`)
    const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
  it(`number`, () => {
    environmentManager.set(`cli_foo`, `4.3`)
    const args = Command.create({ '--foo': z.number() }).parseOrThrow([])
    expect(args).toEqual({ foo: 4.3 })
  })
  it(`env arg is validated`, () => {
    environmentManager.set(`cLi_fOo`, `d`)
    expect(() => Command.create({ '--foo': z.enum([`a`, `b`, `c`]) }).parseOrThrow([]))
      .toThrowErrorMatchingInlineSnapshot(`
        "Invalid argument (via environment variable \\"CLI_FOO\\") for parameter: \\"foo\\". The error was:
        Invalid enum value. Expected 'a' | 'b' | 'c', received 'd'"
      `)
  })
  it(`case of env name does not matter`, () => {
    environmentManager.set(`cLi_fOo`, `bar`)
    const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
    expect(args).toEqual({ foo: `bar` })
  })
})

it(`if environment args enabled, parameter has default, flag arg not given, but env arg given, then env arg wins`, () => {
  environmentManager.set(`CLI_ENV_ARGS`, `true`)
  process.env[`cli_verbose`] = `true`
  const args = Command.create({ '--verbose': z.boolean().default(false) }).parseOrThrow([])
  expect(args).toEqual({ verbose: true })
})
