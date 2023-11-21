import { expectType } from 'tsd'
import type { Name } from '../src/_entrypoints/default.js'
import { as } from './_/helpers.js'

expectType<{ expression: string; canonical: 'v'; long: null; short: 'v'; aliases: { short: []; long: [] } }>(
  as<Name.Parse<'-v'>>(),
)
expectType<{ expression: string; canonical: 'v'; long: null; short: 'v'; aliases: { short: ['x']; long: [] } }>(
  as<Name.Parse<'-v -x'>>(),
)
expectType<{ expression: string; canonical: 'v'; long: null; short: 'v'; aliases: { short: ['x', 'y']; long: [] } }>(
  as<Name.Parse<'-v -x -y'>>(),
)
expectType<{ expression: string; canonical: 'vv'; long: 'vv'; short: null; aliases: { short: []; long: ['xx'] } }>(
  as<Name.Parse<'--vv --xx'>>(),
)
expectType<
  { expression: string; canonical: 'vv'; long: 'vv'; short: null; aliases: { short: []; long: ['xx', 'yy'] } }
>(as<Name.Parse<'--vv --xx --yy'>>())
expectType<{ expression: string; canonical: 'vv'; long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(
  as<Name.Parse<'-v --vv -x --xx'>>(),
)
expectType<{ expression: string; canonical: 'vv'; long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(
  as<Name.Parse<'v vv x xx'>>(),
)
expectType<{ expression: string; canonical: 'vv'; long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(
  as<Name.Parse<'v --vv x xx'>>(),
)
