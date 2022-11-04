import { Command } from '../../src/index.js'
import { environmentManager } from './__helpers__.js'
import { beforeEach, expect } from 'vitest'
import { describe, it } from 'vitest'
import { z } from 'zod'
import { stdout } from '../__mock__.js'

beforeEach(() => environmentManager.set(`CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT`, `true`))

describe(`boolean can be parsed`, () => {
  it(`parses value of true`, () => {
    environmentManager.set(`CLI_PARAM_VERBOSE`, `true`)
    const args = Command.parameters({ '--verbose': z.boolean() }).parse({ line: [] })
    expect(args).toMatchObject({ verbose: true })
  })
  it(`parses value of true which overrides a spec default of false`, () => {
    environmentManager.set(`CLI_PARAM_VERBOSE`, `true`)
    const args = Command.parameters({ '--verbose': z.boolean().default(false) }).parse({ line: [] })
    expect(args).toMatchObject({ verbose: true })
  })
  it(`parses value of false`, () => {
    environmentManager.set(`cli_param_verbose`, `false`)
    const args = Command.parameters({ '--verbose': z.boolean() }).parse({ line: [] })
    expect(args).toMatchObject({ verbose: false })
  })
  describe(`alias`, () => {
    it(`parses value of true`, () => {
      environmentManager.set(`cli_param_VERB`, `true`)
      const args = Command.parameters({ '--verbose --verb': z.boolean() }).parse({ line: [] })
      expect(args).toMatchObject({ verbose: true })
    })
    it(`parses value of false`, () => {
      environmentManager.set(`cli_param_VERB`, `false`)
      const args = Command.parameters({ '--verbose --verb': z.boolean() }).parse({ line: [] })
      expect(args).toMatchObject({ verbose: false })
    })
  })
  describe(`negated`, () => {
    it(`parses negated name with false value`, () => {
      environmentManager.set(`cli_param_no_foo`, `false`)
      const args = Command.parameters({ '--foo': z.boolean() }).parse({ line: [] })
      expect(args).toMatchObject({ foo: true })
    })
    it(`parses negated name with true value`, () => {
      environmentManager.set(`cli_param_no_foo`, `true`)
      const args = Command.parameters({ '--foo': z.boolean() }).parse({ line: [] })
      expect(args).toMatchObject({ foo: false })
    })
    describe(`alias`, () => {
      it(`parses negated alias name with true value`, () => {
        environmentManager.set(`cli_param_no_foobar`, `true`)
        const args = Command.parameters({ '--foo --foobar': z.boolean() }).parse({ line: [] })
        expect(args).toMatchObject({ foo: false })
      })
      it(`parses negated alias name with false value`, () => {
        environmentManager.set(`cli_param_no_foobar`, `false`)
        const args = Command.parameters({ '--foo --foobar': z.boolean() }).parse({ line: [] })
        expect(args).toMatchObject({ foo: true })
      })
    })
  })
})

it(`parses a value specified to be a string`, () => {
  environmentManager.set(`cli_param_foo`, `bar`)
  const args = Command.parameters({ '--foo': z.string() }).parse({ line: [] })
  expect(args).toMatchObject({ foo: `bar` })
})
it(`parses a value specified to be a number`, () => {
  environmentManager.set(`cli_param_foo`, `4.3`)
  const args = Command.parameters({ '--foo': z.number() }).parse({ line: [] })
  expect(args).toMatchObject({ foo: 4.3 })
})
describe(`enum can be parsed`, () => {
  it(`throws an error if the value does not pass validation`, () => {
    environmentManager.set(`cli_param_foo`, `d`)
    Command.parameters({ '--foo': z.enum([`a`, `b`, `c`]) }).parse({ line: [] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
})

it(`ignores the letter casing of env name`, () => {
  environmentManager.set(`cLi_PARAM_fOo`, `bar`)
  const args = Command.parameters({ '--foo': z.string() }).parse({ line: [] })
  expect(args).toMatchObject({ foo: `bar` })
})

it.todo(`takes lower precedence than flags`)
