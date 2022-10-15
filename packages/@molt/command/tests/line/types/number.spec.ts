import { Command } from '../../../src/index.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

it(`casts the input as a number`, () => {
  const args = Command.create({ '--age': z.number() }).parseOrThrow([`--age`, `1`])
  assert<IsExact<{ age: number }, typeof args>>(true)
  expect(args).toMatchObject({ age: 1 })
})

it(`validates the  input`, () => {
  expect(() =>
    Command.create({ '--age': z.number().int() }).parseOrThrow([`--age`, `1.1`])
  ).toThrowErrorMatchingInlineSnapshot(`"Invalid value for age: todo"`)
})

describe(`errors`, () => {
  it(`throws error when argument missing (last position)`, () => {
    expect(() =>
      Command.create({ '--age': z.number() }).parseOrThrow([`--age`])
    ).toThrowErrorMatchingInlineSnapshot(`"Missing argument"`)
  })
  it(`throws error when argument missing (non-last position)`, () => {
    expect(() =>
      Command.create({ '--name': z.string(), '--age': z.number() }).parseOrThrow([` --age`, `--name`, `joe`])
    ).toThrowErrorMatchingInlineSnapshot(`"Missing argument"`)
  })
})
