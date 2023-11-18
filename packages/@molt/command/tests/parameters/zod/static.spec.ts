import { $ } from '../../_/helpers.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

// prettier-ignore
it(`Statically accepts or rejects zod types for the schema`, () => {
 expectType<() => {a:string}>($.parameter(`a`, z.string()).parse)
  expectType<() => {a:number}>($.parameter(`a`, z.number()).parse)
  expectType<() => {a:boolean}>($.parameter(`a`, z.boolean()).parse)
  expectType<() => {a:'a'|'b'}>($.parameter(`a`, z.enum([`a`, `b`])).parse)
  expectType<() => {a:'a'|'b'}>($.parameter(`a`, z.nativeEnum({ a: `a`, b: `b` } as const)).parse)
  expectType<() => {a:1}>($.parameter(`a`, z.literal(1)).parse)
  expectType<() => {a:'a'}>($.parameter(`a`, z.literal(`a`)).parse)
  expectType<() => {a:true}>($.parameter(`a`, z.literal(true)).parse)
  expectType<() => {a:false}>($.parameter(`a`, z.literal(false)).parse)
  // union
  expectType<() => {a:true|false|'a'|'b'}>($.parameter(`a`, z.union([z.boolean(), z.enum([`a`, `b`])])).parse)
  expectType<() => {a:string|number}>			($.parameter(`a`, z.union([z.string(), z.number()])).parse)
  expectType<() => {a:number|'a'|'b'}>		($.parameter(`a`, z.union([z.number(), z.nativeEnum({ a: `a`, b: `b` } as const)])).parse)
  expectType<() => {a:1|'a'|true|false}>	($.parameter(`a`, z.union([z.literal(1), z.literal(`a`), z.literal(true), z.literal(false)])).parse)
	// todo key should be ?
	// optional
  expectType<() => {a:undefined|string}>($.parameter(`a`, z.string().optional()).parse)
  expectType<() => {a:undefined|1}>($.parameter(`a`, z.literal(1).optional()).parse)
	// default
	expectType<() => {a:string}>($.parameter(`a`, z.string().default(`a`)).parse)
  expectType<() => {a:1}>($.parameter(`a`, z.literal(1).default(1)).parse)
	// unsupported
	// @ts-expect-error not supported
	expect(() => $.parameter(`a`, z.unknown())).throws()
})
