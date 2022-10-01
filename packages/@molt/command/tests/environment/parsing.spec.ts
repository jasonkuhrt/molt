import { environmentArgumentName } from '../../src/environment.js'
import { Command } from '../../src/index.js'
import { environmentManager } from './__helpers__.js'
import { beforeEach, expect } from 'vitest'
import { describe, it } from 'vitest'
import { z } from 'zod'

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

it.todo(`takes lower precedence than flags`)
