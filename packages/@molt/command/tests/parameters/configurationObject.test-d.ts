import { expectTypeOf, it } from 'vitest'
import { $, n, s } from '../_/helpers.js'

it(`parameter can receive configuration object`, () => {
  const args = $.parameter(`a`, { type: s.optional() }).parse({ line: [] })
  expectTypeOf(args).toMatchTypeOf<{ a?: string }>()
})

it(`exclusive parameter builder parameter method can receive configuration object`, () => {
  const args = $.parametersExclusive(`foo`, (_) => {
    const x = _.parameter(`a`, { type: s }).parameter(`b`, { type: n })
    return x
  }).parse({ line: [`-a`, `abc`] })
  expectTypeOf(args).toMatchTypeOf<{ foo: { _tag: 'a'; value: string } | { _tag: 'b'; value: number } }>() // prettier-ignore
})
