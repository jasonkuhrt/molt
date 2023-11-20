import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'
import { $, as } from '../_/helpers.js'

it(`arg static type is the union`, () => {
  const args = $.parameter(`x`, z.union([z.string(), z.number()])).parse({ line: [`-x`, `1`] })
  expectType<typeof args>(as<{ x: string | number }>())
})

it(`spec of number|string parses arg as number if number given`, () => {
  const args = $.parameter(`x`, z.union([z.string(), z.number()])).parse({ line: [`-x`, `1`] })
  expect(typeof args.x).toBe(`number`)
  expect(args.x).toBe(1)
})

it(`spec of number|string parses arg as string if non-number given`, () => {
  const args = $.parameter(`x`, z.union([z.string(), z.number()])).parse({ line: [`-x`, `1a`] })
  expect(typeof args.x).toBe(`string`)
  expect(args.x).toBe(`1a`)
})

it(`spec of number|boolean parses arg as boolean true if bool flag given`, () => {
  const args = $.parameter(`x`, z.union([z.boolean(), z.number()])).parse({ line: [`-x`] })
  expect(typeof args.x).toBe(`boolean`)
  expect(args.x).toBe(true)
})

it(`spec of number|boolean parses arg as boolean false if negated bool flag given`, () => {
  const args = $.parameter(`xee`, z.union([z.boolean(), z.number()])).parse({ line: [`--no-xee`] })
  expect(typeof args.xee).toBe(`boolean`)
  expect(args.xee).toBe(false)
})

it(`spec of number|boolean parses arg as boolean false if environment false given`, () => {
  const args = $.parameter(`xee`, z.union([z.boolean(), z.number()])).parse({
    environment: { cli_param_xee: `false` },
  })
  expect(typeof args.xee).toBe(`boolean`)
  expect(args.xee).toBe(false)
})

it(`spec of number|boolean parses arg as boolean true if environment true given`, () => {
  const args = $.parameter(`xee`, z.union([z.boolean(), z.number()])).parse({
    environment: { cli_param_xee: `true` },
  })
  expect(typeof args.xee).toBe(`boolean`)
  expect(args.xee).toBe(true)
})

it(`can use the .or method api sugar of zod`, () => {
  const args = $.parameter(`xee`, z.boolean().or(z.number())).parse({
    environment: { cli_param_xee: `true` },
  })
  expectType<boolean | number>(args.xee)
  expect(typeof args.xee).toBe(`boolean`)
  expect(args.xee).toBe(true)
})
