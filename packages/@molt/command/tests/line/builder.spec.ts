import { Command } from '../../src/index.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`.create`, () => {
  it(`creates a parameters definition`, () => {
    const def = Command.parameters({ x: z.string() })
    expect(def.parse).toBeTypeOf(`function`)
  })
})

describe(`settings`, () => {
  it(`permits setting a description`, () => {
    Command.parameters({ x: z.string() })
      .settings({ description: `foobar` })
      .parse({ line: [`-x`, `foobar`] })
  })
})
