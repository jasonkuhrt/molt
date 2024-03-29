import { describe, expect, it } from 'vitest'
import { $, s } from '../_/helpers.js'

describe(`.create`, () => {
  it(`creates a parameters definition`, () => {
    const def = $.parameter(`x`, s)
    expect(def.parse).toBeTypeOf(`function`)
  })
})

describe(`settings`, () => {
  it(`permits setting a description`, () => {
    $.parameter(`x`, s)
      .settings({ description: `foobar` })
      .parse({ line: [`-x`, `foobar`] })
  })
})
