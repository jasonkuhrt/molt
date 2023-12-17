import { expect, expectTypeOf, test } from 'vitest'
import { z } from 'zod'
import { $ } from '../../_/helpers.js'

// prettier-ignore
test(`Statically accepts or rejects zod types for the schema`, () => {
  expectTypeOf($.parameter(`a`, z.string()).parse).toMatchTypeOf<() => { a: string }>()
  expectTypeOf($.parameter(`a`, z.number()).parse).toMatchTypeOf<() => { a: number }>()
  expectTypeOf($.parameter(`a`, z.boolean()).parse).toMatchTypeOf<() => { a: boolean }>()
  expectTypeOf($.parameter(`a`, z.enum([`a`, `b`])).parse).toMatchTypeOf<() => { a: 'a' | 'b' }>()
  expectTypeOf($.parameter(`a`, z.nativeEnum({ a: `a`, b: `b` } as const)).parse).toMatchTypeOf<() => { a: 'a' | 'b' }>()
  expectTypeOf($.parameter(`a`, z.literal(1)).parse).toMatchTypeOf<() => { a: 1 }>()
  expectTypeOf($.parameter(`a`, z.literal(`a`)).parse).toMatchTypeOf<() => { a: 'a' }>()
  expectTypeOf($.parameter(`a`, z.literal(true)).parse).toMatchTypeOf<() => { a: true }>()
  expectTypeOf($.parameter(`a`, z.literal(false)).parse).toMatchTypeOf<() => { a: false }>()
  // union
  expectTypeOf($.parameter(`a`, z.union([z.boolean(), z.enum([`a`, `b`])])).parse).toMatchTypeOf<() => { a: true | false | 'a' | 'b' }>()
  expectTypeOf($.parameter(`a`, z.union([z.string(), z.number()])).parse).toMatchTypeOf<() => { a: string | number }>()
  expectTypeOf($.parameter(`a`, z.union([z.number(), z.nativeEnum({ a: `a`, b: `b` } as const)])).parse).toMatchTypeOf<() => { a: number | 'a' | 'b' }>()
  expectTypeOf($.parameter(`a`, z.union([z.literal(1), z.literal(`a`), z.literal(true), z.literal(false)])).parse).toMatchTypeOf<() => { a: 1 | 'a' | true | false }>()
  // todo key should be ?
  // optional
  expectTypeOf($.parameter(`a`, z.string().optional()).parse).toMatchTypeOf<() => { a: undefined | string }>()
  expectTypeOf($.parameter(`a`, z.literal(1).optional()).parse).toMatchTypeOf<() => { a: undefined | 1 }>()
  // default
  expectTypeOf($.parameter(`a`, z.string().default(`a`)).parse).toMatchTypeOf<() => { a: string }>()
  expectTypeOf($.parameter(`a`, z.literal(1).default(1)).parse).toMatchTypeOf<() => { a: 1 }>()
  // unsupported
  // @ts-expect-error not supported
  expect(() => $.parameter(`a`, z.unknown())).throws()
})
