import { expectTypeOf, test } from 'vitest'
import { boolean } from './boolean.js'

test('description', () => {
  const x = boolean()
  expectTypeOf(x).toMatchTypeOf<{
    description: (value: string) => typeof x
  }>()
})
