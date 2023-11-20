import { $, n, s } from '../_/helpers.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'

it(`parameter can receive configuration object`, () => {
  const args = $.parameter(`a`, { type: s.optional() }).parse({ line: [] })
  expectType<{ a?: string }>(args)
  expect(args).toMatchObject({})
})

it(`exclusive parameter builder parameter method can receive configuration object`, () => {
  const args = $.parametersExclusive(`foo`, (_) => {
    const x = _.parameter(`a`, { type: s }).parameter(`b`, { type: n })
    return x
  }).parse({ line: [`-a`, `abc`] })
  expectType<{ foo: { _tag: 'a'; value: string } | { _tag: 'b'; value: number } }>(args)
  expect(args).toMatchObject({ foo: { _tag: `a`, value: `abc` } })
})
