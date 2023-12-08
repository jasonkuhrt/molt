import { beforeEach, expect } from 'vitest'
import { describe, it } from 'vitest'
import { $, b, n, pb, s } from '../_/helpers.js'
import { stdout } from '../_/mocks.js'
import { environmentManager } from './__helpers__.js'
import { t } from '../../src/_entrypoints/default.js'

beforeEach(() =>
  environmentManager.set(
    `CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT`,
    `true`,
  ),
)

describe(`boolean can be parsed`, () => {
  it(`parses value of true`, () => {
    environmentManager.set(`CLI_PARAM_VERBOSE`, `true`)
    const args = $.parameter(`--verbose`, b).parse({ line: [] })
    expect(args).toMatchObject({ verbose: true })
  })
  it(`parses value of true which overrides a spec default of false`, () => {
    environmentManager.set(`CLI_PARAM_VERBOSE`, `true`)
    const args = $.parameter(`--verbose`, pb.default(false)).parse({ line: [] })
    expect(args).toMatchObject({ verbose: true })
  })
  it(`parses value of false`, () => {
    environmentManager.set(`cli_param_verbose`, `false`)
    const args = $.parameter(`--verbose`, b).parse({ line: [] })
    expect(args).toMatchObject({ verbose: false })
  })
  describe(`alias`, () => {
    it(`parses value of true`, () => {
      environmentManager.set(`cli_param_VERB`, `true`)
      const args = $.parameter(`--verbose --verb`, b).parse({ line: [] })
      expect(args).toMatchObject({ verbose: true })
    })
    it(`parses value of false`, () => {
      environmentManager.set(`cli_param_VERB`, `false`)
      const args = $.parameter(`--verbose --verb`, b).parse({ line: [] })
      expect(args).toMatchObject({ verbose: false })
    })
  })
  describe(`negated`, () => {
    it(`parses negated name with false value`, () => {
      environmentManager.set(`cli_param_no_foo`, `false`)
      const args = $.parameter(`--foo`, b).parse({ line: [] })
      expect(args).toMatchObject({ foo: true })
    })
    it(`parses negated name with true value`, () => {
      environmentManager.set(`cli_param_no_foo`, `true`)
      const args = $.parameter(`--foo`, b).parse({ line: [] })
      expect(args).toMatchObject({ foo: false })
    })
    describe(`alias`, () => {
      it(`parses negated alias name with true value`, () => {
        environmentManager.set(`cli_param_no_foobar`, `true`)
        const args = $.parameter(`--foo --foobar`, b).parse({ line: [] })
        expect(args).toMatchObject({ foo: false })
      })
      it(`parses negated alias name with false value`, () => {
        environmentManager.set(`cli_param_no_foobar`, `false`)
        const args = $.parameter(`--foo --foobar`, b).parse({ line: [] })
        expect(args).toMatchObject({ foo: true })
      })
    })
  })
})

it(`parses a value specified to be a string`, () => {
  environmentManager.set(`cli_param_foo`, `bar`)
  const args = $.parameter(`--foo`, s).parse({ line: [] })
  expect(args).toMatchObject({ foo: `bar` })
})
it(`parses a value specified to be a number`, () => {
  environmentManager.set(`cli_param_foo`, `4.3`)
  const args = $.parameter(`--foo`, n).parse({ line: [] })
  expect(args).toMatchObject({ foo: 4.3 })
})
describe(`enum can be parsed`, () => {
  it(`throws an error if the value does not pass validation`, () => {
    environmentManager.set(`cli_param_foo`, `d`)
    $.parameter(`--foo`, t.enum([`a`, `b`, `c`])).parse({ line: [] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
})

it(`ignores the letter casing of env name`, () => {
  environmentManager.set(`cLi_PARAM_fOo`, `bar`)
  const args = $.parameter(`--foo`, s).parse({ line: [] })
  expect(args).toMatchObject({ foo: `bar` })
})

it.todo(`takes lower precedence than flags`)
