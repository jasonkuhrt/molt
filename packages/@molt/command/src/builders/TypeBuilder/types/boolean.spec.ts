import { describe, expect, expectTypeOf, test } from 'vitest'
import { boolean } from './boolean.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const b = boolean()

describe(`description`, () => {
  test(`method returning self`, () => {
    expectTypeOf(b).toMatchTypeOf<{description: (value: string) => typeof b}>() // prettier-ignore
  })
  test(`starts unset`, () => {
    expect(BuilderKit.State.get(b).data.description).toEqual(BuilderKit.State.Values.unset) // prettier-ignore
  })
  test(`can have a description`, () => {
    expect(BuilderKit.State.get(b.description(`foo`)).data.description).toMatchObject(`foo`) // prettier-ignore
  })
})
