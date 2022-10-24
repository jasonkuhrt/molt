import { Command } from '../../src/index.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

let c

describe(`errors`, () => {
  describe(`reuse flag`, () => {
    const s = z.string()
    it(`long flag`, () => {
      c = Command.parameter(`alpha`, s)
      // @ts-expect-error test
      c.parameter(`alpha`, s)
    })
    it(`long flag alias`, () => {
      c = Command.parameter(`alpha bravo`, s)
      // @ts-expect-error test
      c.parameter(`bravo`, s)
    })
    it(`short flag`, () => {
      c = Command.parameter(`a`, s)
      // @ts-expect-error test
      c.parameter(`a`, s)
    })
    it(`short flag alias`, () => {
      c = Command.parameter(`a b`, s)
      // @ts-expect-error test
      c.parameter(`b`, s)
    })
  })
})

it(`works`, () => {
  const args = Command.parameter(`foo`, z.string())
    .parameter(`bar`, z.string())
    .settings({ onError: `throw` })
    .parse({ line: [`--foo`, `1`, `--bar`, `2`] })
  expect(args).toMatchObject({ foo: `1`, bar: `2` })
})
