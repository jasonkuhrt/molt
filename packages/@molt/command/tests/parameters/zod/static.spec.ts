import { Command } from '../../../src/index.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

// prettier-ignore
it(`Statically accepts or rejects zod types for the schema`, () => {
 expectType<() => {a:string}>(Command.create().parameter(`a`, z.string()).parse)
  expectType<() => {a:number}>(Command.create().parameter(`a`, z.number()).parse)
  expectType<() => {a:boolean}>(Command.create().parameter(`a`, z.boolean()).parse)
  expectType<() => {a:'a'|'b'}>(Command.create().parameter(`a`, z.enum([`a`, `b`])).parse)
  expectType<() => {a:'a'|'b'}>(Command.create().parameter(`a`, z.nativeEnum({ a: `a`, b: `b` } as const)).parse)
  expectType<() => {a:1}>(Command.create().parameter(`a`, z.literal(1)).parse)
  expectType<() => {a:'a'}>(Command.create().parameter(`a`, z.literal(`a`)).parse)
  expectType<() => {a:true}>(Command.create().parameter(`a`, z.literal(true)).parse)
  expectType<() => {a:false}>(Command.create().parameter(`a`, z.literal(false)).parse)
  // union
  expectType<() => {a:true|false|'a'|'b'}>(Command.create().parameter(`a`, z.union([z.boolean(), z.enum([`a`, `b`])])).parse)
  expectType<() => {a:string|number}>			(Command.create().parameter(`a`, z.union([z.string(), z.number()])).parse)
  expectType<() => {a:number|'a'|'b'}>		(Command.create().parameter(`a`, z.union([z.number(), z.nativeEnum({ a: `a`, b: `b` } as const)])).parse)
  expectType<() => {a:1|'a'|true|false}>	(Command.create().parameter(`a`, z.union([z.literal(1), z.literal(`a`), z.literal(true), z.literal(false)])).parse)
	// todo key should be ?
	// optional
  expectType<() => {a:undefined|string}>(Command.create().parameter(`a`, z.string().optional()).parse)
  expectType<() => {a:undefined|1}>(Command.create().parameter(`a`, z.literal(1).optional()).parse)
	// default
	expectType<() => {a:string}>(Command.create().parameter(`a`, z.string().default(`a`)).parse)
  expectType<() => {a:1}>(Command.create().parameter(`a`, z.literal(1).default(1)).parse)
	// unsupported
	// @ts-expect-error not supported
	expect(() => Command.create().parameter(`a`, z.unknown())).throws()
})
