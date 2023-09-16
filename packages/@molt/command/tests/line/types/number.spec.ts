import { Command } from '../../../src/index.js'
import { n } from '../../_/helpers.js'
import { s } from '../../_/helpers.js'
import { stdout } from '../../_/mocks.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'

it(`casts the input as a number`, () => {
  const args = Command.create()
    .parameter(`--age`, n)
    .parse({ line: [`--age`, `1`] })
  assert<IsExact<{ age: number }, typeof args>>(true)
  expect(args).toMatchObject({ age: 1 })
})

describe(`errors`, () => {
  it(`validates the  input`, () => {
    Command.create()
      .parameter(`--age`, n.int())
      .parse({ line: [`--age`, `1.1`] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`throws error when argument missing (last position)`, () => {
    Command.create()
      .parameter(`--age`, n)
      .parse({ line: [`--age`] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`throws error when argument missing (non-last position)`, () => {
    Command.create()
      .parameter(`--name`, s)
      .parameter(`--age`, n)
      .parse({
        line: [` --age`, `--name`, `joe`],
      })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
})
