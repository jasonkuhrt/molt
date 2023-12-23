import { describe, expect, expectTypeOf, test } from 'vitest'
import { enumeration } from './enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { Enumeration } from '../../../Type/Type.js'
// import { Type } from '../../../Type/index.js'

const m = [`a`] as const
type m = typeof m
// const t = Type.enumeration({
//   members: [`a`],
//   optionality: { _tag: `required` },
// })

describe(`members`, () => {
  test(`constructor sets members`, () => {
    expectTypeOf(BuilderKit.State.get(enumeration(m)).type.type).toMatchTypeOf<
      // works, but it should narrow to string
      // Enumeration<(number|string)[]>
      Enumeration<string[]>
    >()
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
