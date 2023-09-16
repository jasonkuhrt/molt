import { Command } from '../../src/index.js'
import { s } from '../_/helpers.js'
import { describe, expect, it } from 'vitest'

describe(`.create`, () => {
  it(`creates a parameters definition`, () => {
    const def = Command.parameter(`x`, s)
    expect(def.parse).toBeTypeOf(`function`)
  })
})

describe(`settings`, () => {
  it(`permits setting a description`, () => {
    Command.parameter(`x`, s)
      .settings({ description: `foobar` })
      .parse({ line: [`-x`, `foobar`] })
  })
})
