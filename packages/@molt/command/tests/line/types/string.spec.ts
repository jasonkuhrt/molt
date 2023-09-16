import { Command } from '../../../src/index.js'
import { n, s } from '../../_/helpers.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'

describe(`errors`, () => {
  it.each(
    // prettier-ignore
    [
      [`when argument missing (last position)`,     { name: s },                   { line: [`--name`] }],
      [`when argument missing (non-last position)`, { name: s, age: n },  { line: [`--name`, `--age`, `1`] }],
      [`when flag passed twice`,                    { '--name': s },               { line: [`--name`, `1`, `--name`, `1`] }],
      [`when long and short flag passed `,          { '--name -n': s },            { line: [`--name`, `1`, `-n`, `1`] }],
    ],
  )(`%s`, (_, parameters, input) => {
    expect(() => {
      Object.entries(parameters)
        .reduce((chain, data) => chain.parameter(data[0] as any, data[1]), Command.create())
        .settings({ onError: `throw`, helpOnError: false })
        .parse(input)
    }).toThrowErrorMatchingSnapshot()
  })
})

describe(`optional`, () => {
  it(`specified input can be omitted, missing key is possible`, () => {
    const args = Command.create().parameter(`--foo`, s.optional()).parse({ line: [] })
    assert<IsExact<{ foo: string | undefined }, typeof args>>(true)
    expect(Object.keys(args)).not.toContain(`foo`)
  })
  it(`input can be given`, () => {
    const args = Command.create()
      .parameter(`--foo`, s.optional())
      .parse({ line: [`--foo`, `bar`] })
    assert<IsExact<{ foo: string | undefined }, typeof args>>(true)
    expect(args).toMatchObject({ foo: `bar` })
  })
})

it(`is not trimmed by default`, () => {
  expect(
    Command.create()
      .parameter(`name`, s)
      .parse({ line: [`--name`, `foobar  `] }),
  ).toMatchSnapshot()
})
