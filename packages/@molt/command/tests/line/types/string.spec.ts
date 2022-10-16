import { Command } from '../../../src/index.js'
import { stdout } from '../../__helpers__.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// TODO use test.each
describe(`errors`, () => {
  it(`when argument missing (last position)`, () => {
    Command.create({ '--name': z.string() }).parseOrThrow([`--name`])
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`when argument missing (non-last position)`, () => {
    Command.create({ '--name': z.string(), '--age': z.number() }).parseOrThrow([`--name`, ` --age`, `1`])
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  // TODO use test.each
  it.todo(`when flag passed twice`)
  it.todo(`when long and short flag passed `)
})

it(`is validated`, () => {
  Command.create({ '--name': z.string().regex(/[a-z]+/) }).parseOrThrow([`--name`, `BAD`])
  expect(stdout.mock.calls).toMatchSnapshot()
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
