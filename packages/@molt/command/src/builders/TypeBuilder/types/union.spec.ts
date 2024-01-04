import { describe, expect, expectTypeOf, test } from 'vitest'
import { union } from './union.js'
import type { TypeBuilderBoolean } from './boolean.js'
import { boolean } from './boolean.js'
import type { TypeBuilderNumber } from './number.js'
import { number } from './number.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const members = [number(), boolean()] as const
const t = union(members)
const state = BuilderKit.State.get(t)

describe(`members`, () => {
  test(`set after constructor call`, () => {
    expect(state.data.members).toEqual(members)
    expectTypeOf(state.data.members).toEqualTypeOf<readonly [TypeBuilderNumber, TypeBuilderBoolean]>() // prettier-ignore
  })
})
