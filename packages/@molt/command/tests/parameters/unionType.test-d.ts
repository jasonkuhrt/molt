import { expect, expectTypeOf, it } from 'vitest'
import { z } from 'zod'
import { $ } from '../_/helpers.js'

it(`arg static type is the union`, () => {
  const args = $.parameter(`x`, z.union([z.string(), z.number()])).parse({
    line: [`-x`, `1`],
  })
  expectTypeOf(args).toMatchTypeOf<{ x: string | number }>()
})

it(`can use the .or method api sugar of zod`, () => {
  const args = $.parameter(`xee`, z.boolean().or(z.number())).parse({
    environment: { cli_param_xee: `true` },
  })
  expectTypeOf(args.xee).toMatchTypeOf<boolean | number>()
  expect(typeof args.xee).toBe(`boolean`)
  expect(args.xee).toBe(true)
})
