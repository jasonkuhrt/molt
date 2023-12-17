import { describe, expect, it } from 'vitest'
import { $, n } from '../../_/helpers.js'
import { s } from '../../_/helpers.js'
import { stdout } from '../../_/mocks.js'

it(`casts the input as a number`, () => {
  const args = $.parameter(`--age`, n).parse({ line: [`--age`, `1`] })
  expect(args).toMatchObject({ age: 1 })
})

describe(`errors`, () => {
  it(`validates the  input`, () => {
    $.parameter(`--age`, n.int()).parse({ line: [`--age`, `1.1`] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`throws error when argument missing (last position)`, () => {
    $.parameter(`--age`, n).parse({ line: [`--age`] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`throws error when argument missing (non-last position)`, () => {
    $.parameter(`--name`, s)
      .parameter(`--age`, n)
      .parse({
        line: [` --age`, `--name`, `joe`],
      })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
})
