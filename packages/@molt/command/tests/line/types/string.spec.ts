import { Command } from '../../../src/index.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`errors`, () => {
  it.each(
    // prettier-ignore
    [
      [`when argument missing (last position)`,     { name: z.string() },                   { line: [`--name`] }],
      [`when argument missing (non-last position)`, { name: z.string(), age: z.number() },  { line: [`--name`, `--age`, `1`] }],
      [`when flag passed twice`,                    { '--name': z.string() },               { line: [`--name`, `1`, `--name`, `1`] }],
      [`when long and short flag passed `,          { '--name -n': z.string() },            { line: [`--name`, `1`, `-n`, `1`] }],
    ]
  )(`%s`, (_, parameters, input) => {
    expect(() =>
      Command.parameters(parameters).settings({ onError: `throw`, helpOnError: false }).parse(input)
    ).toThrowErrorMatchingSnapshot()
  })
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

it(`is not trimmed by default`, () => {
  expect(Command.parameters({ name: z.string() }).parse({ line: [`--name`, `foobar  `] })).toMatchSnapshot()
})
