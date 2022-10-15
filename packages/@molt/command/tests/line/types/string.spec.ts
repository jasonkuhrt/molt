import { Command } from '../../../src/index.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// TODO use test.each
describe(`errors`, () => {
  it(`when argument missing (last position)`, () => {
    expect(() =>
      Command.create({ '--name': z.string() }).parseOrThrow([`--name`])
    ).toThrowErrorMatchingInlineSnapshot(`"Missing argument"`)
  })
  it(`when argument missing (non-last position)`, () => {
    expect(() =>
      Command.create({ '--name': z.string(), '--age': z.number() }).parseOrThrow([`--name`, ` --age`, `1`])
    ).toThrowErrorMatchingInlineSnapshot(`"Missing argument"`)
  })
  // TODO use test.each
  it.todo(`when flag passed twice`)
  it.todo(`when long and short flag passed `)
})

it(`is validated`, () => {
  expect(() =>
    Command.create({ '--name': z.string().regex(/[a-z]+/) }).parseOrThrow([`--name`, `BAD`])
  ).toThrowErrorMatchingInlineSnapshot(`"Invalid value for name: todo"`)
})

describe(`optional`, () => {
  it(`specified input can be omitted, undefined is possible`, () => {
    const args = Command.create({ '--foo': z.string().optional() }).parseOrThrow([])
    assert<IsExact<{ foo: string | undefined }, typeof args>>(true)
    expect(args).toMatchObject({ foo: undefined })
  })
  it(`input can be given`, () => {
    const args = Command.create({ '--foo': z.string().optional() }).parseOrThrow([`--foo`, `bar`])
    assert<IsExact<{ foo: string | undefined }, typeof args>>(true)
    expect(args).toMatchObject({ foo: `bar` })
  })
})
