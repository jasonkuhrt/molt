import { Command } from '../../../src/index.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`errors`, () => {
  it(`throws error when argument missing (last position)`, () => {
    expect(() =>
      Command.create({ '--name': z.string() }).parseOrThrow([`--name`])
    ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"name\\"."`)
  })
  it(`throws error when argument missing (non-last position)`, () => {
    expect(() =>
      Command.create({ '--name': z.string(), '--age': z.number() }).parseOrThrow([`--name`, ` --age`, `1`])
    ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"name\\"."`)
  })
})

it(`is validated`, () => {
  expect(() => Command.create({ '--name': z.string().regex(/[a-z]+/) }).parseOrThrow([`--name`, `BAD`]))
    .toThrowErrorMatchingInlineSnapshot(`
            "Invalid argument for parameter: \\"name\\". The error was:
            Invalid"
          `)
})

describe(`optional`, () => {
  it(`specified input can be omitted, undefined is possible`, () => {
    const args = Command.create({ '--foo': z.string().optional() }).parseOrThrow([])
    assert<IsExact<{ foo: string | undefined }, typeof args>>(true)
    expect(args).toEqual({ foo: undefined })
  })
  it(`input can be given`, () => {
    const args = Command.create({ '--foo': z.string().optional() }).parseOrThrow([`--foo`, `bar`])
    assert<IsExact<{ foo: string | undefined }, typeof args>>(true)
    expect(args).toEqual({ foo: `bar` })
  })
})
