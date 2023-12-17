import { describe, expect, expectTypeOf, it } from 'vitest'
import { $, s } from '../../_/helpers.js'

describe(`optional`, () => {
  it(`specified input can be omitted, missing key is possible`, () => {
    const args = $.parameter(`--foo`, s.optional()).parse({ line: [] })
    expectTypeOf(args).toEqualTypeOf<{ foo: string | undefined }>()
    expect(Object.keys(args)).not.toContain(`foo`)
  })
  it(`input can be given`, () => {
    const args = $.parameter(`--foo`, s.optional()).parse({
      line: [`--foo`, `bar`],
    })
    expectTypeOf(args).toEqualTypeOf<{ foo: string | undefined }>()
  })
})
