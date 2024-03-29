import { beforeEach, expect } from 'vitest'
import { describe, it } from 'vitest'
import { $, s } from '../../_/helpers.js'
import { stdout } from '../../_/mocks.js'
import { environmentManager } from '../__helpers__.js'

let args

it(`can be disabled`, () => {
  args = $.parameter(`--foo`, s)
    .settings({ parameters: { environment: { $default: { prefix: false } } } })
    .parse({ line: [], environment: { foo: `bar` } })
  expect(args).toMatchObject({ foo: `bar` })
})
it(`can be customized to a different prefix`, () => {
  args = $.parameter(`--foo`, s)
    .settings({ parameters: { environment: { $default: { prefix: `FOO` } } } })
    .parse({ line: [], environment: { FOO_foo: `bar` } })
  expect(args).toMatchObject({ foo: `bar` })
})
it(`can be customized to multiple accepted different prefixes`, () => {
  args = $.parameter(`--foo`, s)
    .parameter(`--bar`, s)
    .settings({ parameters: { environment: { $default: { prefix: [`FOO`, `BAR`] } } } })
    .parse({ line: [], environment: { FOO_foo: `qux1`, BAR_bar: `qux2` } })
  expect(args).toMatchObject({ foo: `qux1`, bar: `qux2` })
})
it(`defaults to CLI_PARAM or CLI_PARAMETERS`, () => {
  args = $.parameter(`--foo`, s)
    .parameter(`--bar`, s)
    .parse({
      line: [],
      environment: {
        cli_param_foo: `qux1`,
        cli_parameter_bar: `qux2`,
      },
    })
  expect(args).toMatchObject({ foo: `qux1`, bar: `qux2` })
})
describe(`error`, () => {
  it(`when using prefix and there is a typo`, () => {
    // TODO show not just envar prefix in error message json
    $.parameter(`--foo`, s)
      .settings({ helpOnNoArguments: false })
      .parse({ line: [], environment: { cli_param_bar: `qux1` } })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`when using multiple prefixes and args passed for all param variations`, () => {
    // TODO show not just envar prefix in error message json
    $.parameter(`--foo`, s)
      .parameter(`--bar`, s)
      .parse({
        line: [],
        environment: {
          cli_param_bar: `qux1`,
          cli_parameter_bar: `qux2`,
          cli_param_foo: `qux1`,
          cli_parameter_foo: `qux2`,
        },
      })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it.todo(`when argument collision and typo then both errors are shown`)
})

describe(`default environment argument parameter name prefix`, () => {
  beforeEach(() => environmentManager.set(`CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT`, `true`))

  it(`argument can be passed by CLI_PARAMETER prefix`, () => {
    environmentManager.set(`cli_parameter_foo`, `bar`)
    args = $.parameter(`--foo`, s).parse({ line: [] })
    expect(args).toMatchObject({ foo: `bar` })
  })
  it(`argument can be passed by CLI_PARAM prefix`, () => {
    environmentManager.set(`cli_param_foo`, `bar`)
    args = $.parameter(`--foo`, s).parse({ line: [] })
    expect(args).toMatchObject({ foo: `bar` })
  })
  it(`when both argument CLI_PARAM and CLI_PARAMETER are passed then an error is thrown`, () => {
    environmentManager.set(`cli_param_foo`, `bar1`)
    environmentManager.set(`cli_parameter_foo`, `bar2`)
    $.parameter(`--foo`, s).settings({ helpOnNoArguments: false }).parse({ line: [] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
})
