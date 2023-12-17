import { describe, expect, expectTypeOf, it } from 'vitest'
import { $, b } from '../../_/helpers.js'

it(`implies true`, () => {
  const args = $.parameter(`--verbose`, b).parse({ line: [`--verbose`] })
  expectTypeOf(args).toEqualTypeOf<{ verbose: boolean }>()
})

it(`has a negated variant that implies false`, () => {
  const args = $.parameter(`--verbose`, b).parse({ line: [`--no-verbose`] })
  expectTypeOf(args).toEqualTypeOf<{ verbose: boolean }>()
})

describe(`when a parameter default is specified`, () => {
  it(`uses the default value when no input given`, () => {
    const args = $.parameter(`--verbose`, b.default(false)).parse({ line: [] })
    expectTypeOf(args).toEqualTypeOf<{ verbose: boolean }>()
  })
  it(`accepts the negated parameter`, () => {
    const args = $.parameter(`--verbose`, b.default(true)).parse({
      line: [`--no-verbose`],
    })
    expectTypeOf(args).toEqualTypeOf<{ verbose: boolean }>()
  })
})

describe(`when parameter is optional`, () => {
  it(`allows no input to be given, resulting in omitted key`, () => {
    const args = $.parameter(`--verbose`, b.optional())
      .settings({ helpOnNoArguments: false })
      .parse({ line: [] })
    expectTypeOf(args).toEqualTypeOf<{ verbose: boolean | undefined }>()
  })
  it(`input can be given`, () => {
    const args = $.parameter(`--verbose`, b.optional()).parse({
      line: [`--verbose`],
    })
    expectTypeOf(args).toEqualTypeOf<{ verbose: boolean | undefined }>()
  })
})
