import { Command } from '../../../src/index.js'
import { stdout } from '../../__helpers__.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// TODO use test.each
describe(`errors`, () => {
  it(`when argument missing (last position)`, () => {
    Command.parameters({ '--name': z.string() }).parse({ line: [`--name`] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`when argument missing (non-last position)`, () => {
    Command.parameters({ '--name': z.string(), '--age': z.number() }).parse({
      line: [`--name`, ` --age`, `1`],
    })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  // TODO use test.each
  it.todo(`when flag passed twice`)
  it.todo(`when long and short flag passed `)
})

it(`is validated`, () => {
  Command.parameters({ '--name': z.string().regex(/[a-z]+/) }).parse({ line: [`--name`, `BAD`] })
  expect(stdout.mock.calls).toMatchSnapshot()
})

describe(`optional`, () => {
  it(`specified input can be omitted, undefined is possible`, () => {
    const args = Command.parameters({ '--foo': z.string().optional() }).parse({ line: [] })
    assert<IsExact<{ foo: string | undefined }, typeof args>>(true)
    expect(args).toMatchObject({ foo: undefined })
  })
  it(`input can be given`, () => {
    const args = Command.parameters({ '--foo': z.string().optional() }).parse({ line: [`--foo`, `bar`] })
    assert<IsExact<{ foo: string | undefined }, typeof args>>(true)
    expect(args).toMatchObject({ foo: `bar` })
  })
})
