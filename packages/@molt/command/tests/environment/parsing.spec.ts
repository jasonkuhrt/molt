import { environmentArgumentName } from '../../src/environment.js'
import { Command } from '../../src/index.js'
import { environmentManager } from './__helpers__.js'
import { beforeEach, expect } from 'vitest'
import { describe, it } from 'vitest'
import { z } from 'zod'

beforeEach(() => environmentManager.set(`CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT`, `true`))

describe(`boolean can be parsed`, () => {
  it(`parses value of true`, () => {
    environmentManager.set(environmentArgumentName(`VERBOSE`), `true`)
    const args = Command.create({ '--verbose': z.boolean() }).parseOrThrow([])
    expect(args).toEqual({ verbose: true })
  })
  it(`parses value of true which overrides a spec default of false`, () => {
    environmentManager.set(environmentArgumentName(`VERBOSE`), `true`)
    const args = Command.create({ '--verbose': z.boolean().default(false) }).parseOrThrow([])
    expect(args).toEqual({ verbose: true })
  })
  it(`parses value of false`, () => {
    environmentManager.set(environmentArgumentName(`verbose`), `false`)
    const args = Command.create({ '--verbose': z.boolean() }).parseOrThrow([])
    expect(args).toEqual({ verbose: false })
  })
})

it(`parses a value specified to be a string`, () => {
  environmentManager.set(environmentArgumentName(`foo`), `bar`)
  const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
  expect(args).toEqual({ foo: `bar` })
})
it(`parses a value specified to be a number`, () => {
  environmentManager.set(environmentArgumentName(`foo`), `4.3`)
  const args = Command.create({ '--foo': z.number() }).parseOrThrow([])
  expect(args).toEqual({ foo: 4.3 })
})
describe(`enum can be parsed`, () => {
  it(`throws an error if the value does not pass validation`, () => {
    environmentManager.set(environmentArgumentName(`foo`), `d`)
    expect(() =>
      Command.create({ '--foo': z.enum([`a`, `b`, `c`]) }).parseOrThrow([])
    ).toThrowErrorMatchingSnapshot()
  })
})

it(`ignores the letter casing of env name`, () => {
  environmentManager.set(`cLi_PARAM_fOo`, `bar`)
  const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
  expect(args).toEqual({ foo: `bar` })
})

it.todo(`takes lower precedence than flags`)
