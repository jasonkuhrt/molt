import { expectTypeOf, describe, test } from 'vitest'
import { $, s } from '../_/helpers.js'

describe(`errors`, () => {
  test.todo(`when a flag and an alias of it are given there is an error`)
  test.todo(`when a long flag and its short flag are given there is an error`)
})

describe(`string`, () => {
  test(`kebab case param spec can be passed camel case parameter`, () => {
    const args = $.parameter(`--foo-bar`, s).parse({
      line: [`--fooBar`, `foo`],
    })
    expectTypeOf(args).toEqualTypeOf<{ fooBar: string }>()
  })
  test(`kebab case param spec can be passed kebab case parameter`, () => {
    const args = $.parameter(`--foo-bar`, s).parse({
      line: [`--foo-bar`, `foo`],
    })
    expectTypeOf(args).toEqualTypeOf<{ fooBar: string }>()
  })
  test(`camel case param spec can be passed kebab case parameter`, () => {
    const args = $.parameter(`--fooBar`, s).parse({
      line: [`--foo-bar`, `foo`],
    })
    expectTypeOf(args).toEqualTypeOf<{ fooBar: string }>()
  })
  test(`camel case param spec can be passed camel case parameter`, () => {
    const args = $.parameter(`--fooBar`, s).parse({ line: [`--fooBar`, `foo`] })
    expectTypeOf(args).toEqualTypeOf<{ fooBar: string }>()
  })
})
