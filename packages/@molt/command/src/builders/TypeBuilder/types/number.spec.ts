import { describe, expect, expectTypeOf, test } from 'vitest'
import { number } from './number.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const t = number()
const state = BuilderKit.State.get(t)

describe(`description`, () => {
  test(`method returning self`, () => {
    expectTypeOf(t).toMatchTypeOf<{ description: (value: string) => typeof t }>() // prettier-ignore
  })
  test(`initially unset`, () => {
    expect(state).toMatchObject({ description: BuilderKit.State.Values.unset }) // prettier-ignore
  })
  test(`set after method call`, () => {
    expect(BuilderKit.State.get(t.description(`foo`))).toMatchObject({ description: `foo` }) // prettier-ignore
  })
  test(`immutably reset after second method call`, () => {
    const t2 = t.description(`foo`)
    expect(BuilderKit.State.get(t2)).toMatchObject({ description: `foo` }) // prettier-ignore
    expectTypeOf<BuilderKit.State.Get<typeof t2>>().toMatchTypeOf<{ description: { value: `foo` }}>() // prettier-ignore
    const t3 = t2.description(`bar`)
    expect(BuilderKit.State.get(t3)).toMatchObject({ description: `bar` }) // prettier-ignore
    expectTypeOf<BuilderKit.State.Get<typeof t3>>().toMatchTypeOf<{ description: { value: `bar` }}>() // prettier-ignore
  })
})
