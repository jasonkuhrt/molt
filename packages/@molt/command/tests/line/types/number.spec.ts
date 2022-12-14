import { Command } from '../../../src/index.js'
import { stdout } from '../../_/mocks.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

it(`casts the input as a number`, () => {
  const args = Command.parameters({ '--age': z.number() }).parse({ line: [`--age`, `1`] })
  assert<IsExact<{ age: number }, typeof args>>(true)
  expect(args).toMatchObject({ age: 1 })
})

describe(`errors`, () => {
  it(`validates the  input`, () => {
    Command.parameters({ '--age': z.number().int() }).parse({ line: [`--age`, `1.1`] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`throws error when argument missing (last position)`, () => {
    Command.parameters({ '--age': z.number() }).parse({ line: [`--age`] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`throws error when argument missing (non-last position)`, () => {
    Command.parameters({ '--name': z.string(), '--age': z.number() }).parse({
      line: [` --age`, `--name`, `joe`],
    })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
})
