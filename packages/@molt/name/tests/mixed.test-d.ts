import { expectTypeOf, test } from 'vitest'
import type { Name } from '../src/_entrypoints/default.js'

// prettier-ignore
test('mixed', () => {
  expectTypeOf<{ expression: string; canonical: 'v'; long: null; short: 'v'; aliases: { short: []; long: [] } }>().toMatchTypeOf<Name.Parse<'-v'>>()
  expectTypeOf<{ expression: string; canonical: 'v'; long: null; short: 'v'; aliases: { short: ['x']; long: [] } }>().toMatchTypeOf<Name.Parse<'-v -x'>>()
  expectTypeOf<{ expression: string; canonical: 'v'; long: null; short: 'v'; aliases: { short: ['x', 'y']; long: [] } }>().toMatchTypeOf<Name.Parse<'-v -x -y'>>()
  expectTypeOf<{ expression: string; canonical: 'vv'; long: 'vv'; short: null; aliases: { short: []; long: ['xx'] } }>().toMatchTypeOf<Name.Parse<'--vv --xx'>>()
  expectTypeOf<{ expression: string; canonical: 'vv'; long: 'vv'; short: null; aliases: { short: []; long: ['xx', 'yy'] } }>().toMatchTypeOf<Name.Parse<'--vv --xx --yy'>>()
  expectTypeOf<{ expression: string; canonical: 'vv'; long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>().toMatchTypeOf<Name.Parse<'-v --vv -x --xx'>>()
  expectTypeOf<{ expression: string; canonical: 'vv'; long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>().toMatchTypeOf<Name.Parse<'v vv x xx'>>()
  expectTypeOf<{ expression: string; canonical: 'vv'; long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>().toMatchTypeOf<Name.Parse<'v --vv x xx'>>()
})
