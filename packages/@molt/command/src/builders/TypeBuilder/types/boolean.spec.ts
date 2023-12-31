import { describe, expect, expectTypeOf, test } from 'vitest'
import { boolean } from './boolean.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const t = boolean()

describe(`description`, () => {
  test(`method returning self`, () => {
    expectTypeOf(t).toMatchTypeOf<{
      description: (value: string) => typeof t
    }>()
  })
  test(`starts unset`, () => {
    expect(BuilderKit.State.get(t)).toMatchObject({
      description: BuilderKit.State.Values.unset,
    })
  })
  test(`can have a description`, () => {
    expect(BuilderKit.State.get(t.description(`foo`))).toMatchObject({
      description: `foo`,
    })
  })
})