import { Command } from '../../src/index.js'
import { n, s } from '../_/helpers.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'

it(`parameter can receive configuration object`, () => {
  const args = Command.parameter(`a`, { schema: s.optional() }).parse({ line: [] })
  expectType<{ a?: string }>(args)
  expect(args).toMatchObject({})
})

// it(`exclusive parameter builder parameter method can receive configuration object`, () => {
//   const args = Command.parametersExclusive(`foo`, (_) => {
//     const x = _.parameter(`x`, { schema: s }).parameter(`a`, { schema: s }) //.parameter(`b`, { schema: s })
//     return x
//   }).parse({ line: [`-a abc`] })
//   expectType<{ foo: { _tag: 'a'; value: string } | { _tag: 'b'; value: number } }>(args)
//   expect(args).toMatchObject({ a: `abc` })
// })
