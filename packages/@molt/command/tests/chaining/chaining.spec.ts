import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { $ } from '../_/helpers.js'

let c
const s = z.string()

describe(`errors`, () => {
  describe(`reserved flag`, () => {
    it(`help`, () => {
      // @ts-expect-error test
      $.parameter(`help`, s)
    })
    it(`help`, () => {
      // @ts-expect-error test
      $.parameter(`h`, s)
    })
    it(`h help`, () => {
      // @ts-expect-error test
      $.parameter(`h help`, s)
    })
  })
  describe(`reuse flag`, () => {
    it(`long flag`, () => {
      c = $.parameter(`alpha`, s)
      // @ts-expect-error test
      c.parameter(`alpha`, s)
    })
    it(`long flag alias`, () => {
      c = $.parameter(`alpha bravo`, s)
      // @ts-expect-error test
      c.parameter(`bravo`, s)
    })
    it(`short flag`, () => {
      c = $.parameter(`a`, s)
      // @ts-expect-error test
      c.parameter(`a`, s)
    })
    it(`short flag alias`, () => {
      c = $.parameter(`a b`, s)
      // @ts-expect-error test
      c.parameter(`b`, s)
    })
  })
})

it(`works`, () => {
  const args = $.parameter(`foo`, z.string())
    .parameter(`bar`, z.string())
    .parse({ line: [`--foo`, `1`, `--bar`, `2`] })
  expect(args).toMatchObject({ foo: `1`, bar: `2` })
})
