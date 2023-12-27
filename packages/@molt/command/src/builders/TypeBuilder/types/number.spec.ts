import { describe, expect, expectTypeOf, test } from 'vitest'
import { number } from './number.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const t = number()

describe(`description`, () => {
  test(`method returning self`, () => {
    expectTypeOf(t).toMatchTypeOf<{
      description: (value: string) => typeof t
    }>()
  })
  test(`initially unset`, () => {
    expect(BuilderKit.State.get(t)).toMatchObject({
      description: BuilderKit.State.Values.unset,
    })
  })
  test(`set after method call`, () => {
    expect(BuilderKit.State.get(t.description(`foo`))).toMatchObject({
      description: `foo`,
    })
  })
  test(`immutably reset after second method call`, () => {
    const t2 = t.description(`foo`)
    const t3 = t2.description(`bar`)
    expect(BuilderKit.State.get(t2)).toMatchObject({ description: `foo` })
    expect(BuilderKit.State.get(t3)).toMatchObject({ description: `bar` })
  })
})
