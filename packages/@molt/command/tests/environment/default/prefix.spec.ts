import { Command } from '../../../src/index.js'
import { environmentManager } from '../__helpers__.js'
import { beforeEach, expect } from 'vitest'
import { describe, it } from 'vitest'
import { z } from 'zod'

it(`can be disabled`, () => {
  environmentManager.set(`foo`, `bar`)
  const args = Command.create({ '--foo': z.string() })
    .settings({ parameters: { environment: { $default: { prefix: null } } } })
    .parseOrThrow([])
  expect(args).toEqual({ foo: `bar` })
})
it(`can be customized to a different prefix`, () => {
  environmentManager.set(`FOO_foo`, `bar`)
  const args = Command.create({ '--foo': z.string() })
    .settings({ parameters: { environment: { $default: { prefix: `FOO` } } } })
    .parseOrThrow([])
  expect(args).toEqual({ foo: `bar` })
})
it(`can be customized to multiple accepted different prefixes`, () => {
  environmentManager.set(`FOO_foo`, `qux1`)
  environmentManager.set(`BAR_bar`, `qux2`)
  const args = Command.create({ '--foo': z.string(), '--bar': z.string() })
    .settings({ parameters: { environment: { $default: { prefix: [`FOO`, `BAR`] } } } })
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
    expect(() => Command.create({ '--foo': z.string() }).parseOrThrow([])).toThrowErrorMatchingInlineSnapshot(
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