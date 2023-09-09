/* eslint-disable */

import { _, match } from '../../src/Pattern/Pattern.js'
import { expect, it } from 'vitest'

it.each([
  // Scalar
  [1, 1, true],
  [1, 2, false],
  [false, false, true],
  [false, true, false],
  [`a`, `a`, true],
  [`a`, `b`, false],
  [null, null, true],
  // Shallow object
  [{ a: 1 }, {}, true],
  [{ a: 1 }, { a: 2 }, false],
  [{ a: 1 }, { a: 1 }, true],
  // Deep object
  [{ a: { b: 2 } }, { a: {} }, true],
  [{ a: { b: 2 } }, { a: { b: 1 } }, false],
  [{ a: { b: 2 } }, { a: { b: 2 } }, true],
  // Non deterministic
  [1, [1], true],
  [1, [1, 2], true],
  [1, [2, 3], false],
  [1, [], false],
  [{ a: { b: 2 } }, [{ a: {} }, { a: { b: 2 } }], true],
  [{ a: { b: 2 } }, { a: [{ b: 2 }, { b: 1 }] }, true],
  // wildcard
  [1, _, true],
  [{ a: { b: 2 } }, _, true],
  [{ a: { b: 2 } }, { a: { b: _ } }, true],
  // array data
  [{ x: [`1`] }, { x: [`1`] }, true],
  [{ x: [`1`] }, { x: [[`1`]] }, true],
  [{ x: [`1`] }, { x: [[`1`], ['2']] }, true],
  [{ x: [`1`] }, { x: [`2`] }, false],
  [{ x: [`1`] }, { x: [`1`, '2'] }, false],
])(`%s %s %s`, (data, pattern, expected) => {
  expect(match(data, pattern as any)).toBe(expected)
})

const staticTypeTests_ = () => {
  // array data
  const d = { x: [`1`] }
  // OK
  match(d, { x: [`1`] })
  match(d, { x: [[`1`], [`2`]] })
  match(d, { x: [`2`] })
  match(d, { x: [`1`, `2`] })
  // @ts-expect-error
  match(d, { x: `1` })
  // @ts-expect-error
  match(d, { x: [['1'], '2'] })

  // scalar
  // @ts-expect-error
  match(1, '1')
  match(1, 1)
  // @ts-expect-error
  match('a', 'b')
  match('a', 'a')
  // @ts-expect-error
  match(true, false)
  match(true, true)

  // scalar non-deterministic
  match(1, [])
  match(1, [1])
  match(1, [1, 1])
  // // @ts-expect-error
  // checkMatches(null, [null])
  // // @ts-expect-error
  // checkMatches(true, [true])
  // @ts-expect-error
  match('a', ['a', 'b'])
  match('a', ['a', 'a'])

  // shallow object
  // @ts-expect-error
  match({ a: 1 }, { a: `1` })
  match({ a: 1 }, { a: 1 })
  // shallow object non-deterministic
  // @ts-expect-error
  match({ a: 1 }, [{ a: '1' }])
  match({ a: 1 }, [{ a: 1 }, { a: 2 }])
  match({ a: 1 }, { a: [1, 2] })

  // deep object
  // @ts-expect-error
  match({ a: { b1: 2, b2: 3 } }, { a: { b1: 'a' } })
  match({ a: { b1: 2, b2: 3 } }, { a: { b1: 2 } })
  match({ a: { b1: 2, b2: 3 } }, { a: {} })
  // deep object non-deterministic
  // @ts-expect-error
  match({ a: { b1: 2, b2: 3 } }, { a: [{ b1: 2 }, { b2: '3' }] })
  match({ a: { b1: 2, b2: 3 } }, { a: [{ b1: 2 }, { b2: 3 }] })
  match({ a: { b1: 2, b2: 3 } }, [{ a: { b1: 2 } }, {}])
  // todo this is a silly pattern and should be rejected
  match({ a: { b1: 2, b2: 3 } }, { a: [{}, {}] })

  // with unions
  match({ a: 1 as 1 | 2 }, { a: [1, 2] })
}
