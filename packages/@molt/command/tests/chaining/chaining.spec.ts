import { Command } from '../../src/index.js'
import { describe, it } from 'vitest'
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
