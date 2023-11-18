import { C } from '../_/helpers.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

let c
const s = z.string()

describe(`errors`, () => {
  describe(`reserved flag`, () => {
    it(`help`, () => {
      // @ts-expect-error test
      C.parameter(`help`, s)
    })
    it(`help`, () => {
      // @ts-expect-error test
      C.parameter(`h`, s)
    })
    it(`h help`, () => {
      // @ts-expect-error test
      C.parameter(`h help`, s)
    })
  })
  describe(`reuse flag`, () => {
    it(`long flag`, () => {
      c = C.parameter(`alpha`, s)
      // @ts-expect-error test
      c.parameter(`alpha`, s)
    })
    it(`long flag alias`, () => {
      c = C.parameter(`alpha bravo`, s)
      // @ts-expect-error test
      c.parameter(`bravo`, s)
    })
    it(`short flag`, () => {
      c = C.parameter(`a`, s)
      // @ts-expect-error test
      c.parameter(`a`, s)
    })
    it(`short flag alias`, () => {
      c = C.parameter(`a b`, s)
      // @ts-expect-error test
      c.parameter(`b`, s)
    })
  })
})

it(`works`, () => {
  const args = C.parameter(`foo`, z.string())
    .parameter(`bar`, z.string())
    .parse({ line: [`--foo`, `1`, `--bar`, `2`] })
  expect(args).toMatchObject({ foo: `1`, bar: `2` })
})
