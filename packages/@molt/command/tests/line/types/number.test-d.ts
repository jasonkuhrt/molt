import { expect, expectTypeOf, it } from 'vitest'
import { $, n } from '../../_/helpers.js'

it(`casts the input as a number`, () => {
  const args = $.parameter(`--age`, n).parse({ line: [`--age`, `1`] })
  expectTypeOf(args).toEqualTypeOf<{ age: number }>()
  expect(args).toMatchObject({ age: 1 })
})
