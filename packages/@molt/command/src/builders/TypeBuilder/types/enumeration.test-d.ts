import { describe, expect, expectTypeOf, test } from 'vitest'
import { enumeration } from './enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const m = [`a`] as const
type m = typeof m

describe(`members`, () => {
  test(`constructor sets members`, () => {
    expectTypeOf(
      BuilderKit.State.get(enumeration(m)).members.value,
    ).toMatchTypeOf<readonly string[]>()
  })
})

describe(`description`, () => {
  test(`starts unset`, () => {
    expect(BuilderKit.State.get(enumeration(m))).toMatchObject({
      description: BuilderKit.State.Values.unset,
    })
  })
  test(`can have a description`, () => {
    expect(
      BuilderKit.State.get(enumeration(m).description(`foo`)),
    ).toMatchObject({
      description: `foo`,
    })
  })
})
