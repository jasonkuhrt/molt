/* eslint-disable */

import { _, checkMatches } from '../../src/Pattern/Pattern.js'
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
])(`%s %s %s`, (data, pattern, expected) => {
  expect(checkMatches(data, pattern as any)).toBe(expected)
})

// scalar
// @ts-expect-error
checkMatches(1, '1')
checkMatches(1, 1)
// @ts-expect-error
checkMatches('a', 'b')
checkMatches('a', 'a')
// @ts-expect-error
checkMatches(true, false)
checkMatches(true, true)

// scalar non-deterministic
// @ts-expect-error
checkMatches(1, [])
// @ts-expect-error
checkMatches(1, [1])
checkMatches(1, [1, 1])
// // @ts-expect-error
// checkMatches(null, [null])
// // @ts-expect-error
// checkMatches(true, [true])
// @ts-expect-error
checkMatches('a', ['a', 'b'])
checkMatches('a', ['a', 'a'])

// shallow object
// @ts-expect-error
checkMatches({ a: 1 }, { a: `1` })
checkMatches({ a: 1 }, { a: 1 })
// shallow object non-deterministic
// @ts-expect-error
checkMatches({ a: 1 }, [{ a: '1' }])
checkMatches({ a: 1 }, [{ a: 1 }, { a: 2 }])
checkMatches({ a: 1 }, { a: [1, 2] })

// deep object
// @ts-expect-error
checkMatches({ a: { b1: 2, b2: 3 } }, { a: { b1: 'a' } })
checkMatches({ a: { b1: 2, b2: 3 } }, { a: { b1: 2 } })
checkMatches({ a: { b1: 2, b2: 3 } }, { a: {} })
// deep object non-deterministic
// @ts-expect-error
checkMatches({ a: { b1: 2, b2: 3 } }, { a: [{ b1: 2 }, { b2: '3' }] })
checkMatches({ a: { b1: 2, b2: 3 } }, { a: [{ b1: 2 }, { b2: 3 }] })
checkMatches({ a: { b1: 2, b2: 3 } }, [{ a: { b1: 2 } }, {}])
// todo this is a silly pattern and should be rejected
checkMatches({ a: { b1: 2, b2: 3 } }, { a: [{}, {}] })

// with unions
checkMatches({ a: 1 as 1 | 2 }, { a: [1, 2] })
