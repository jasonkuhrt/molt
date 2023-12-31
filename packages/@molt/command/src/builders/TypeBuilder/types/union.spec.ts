import { describe, expect, expectTypeOf, test } from 'vitest'
import { union } from './union.js'
import { boolean } from './boolean.js'
import { number } from './number.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const members = [number(), boolean()]
const t = union(members)
const state = BuilderKit.State.get(t)

describe(`members`, () => {
  test(`constructor sets members`, () => {
    expect(state).toMatchObject({ members })
    expectTypeOf(state.members.value).toMatchTypeOf<readonly string[]>() // prettier-ignore
  })
})

describe(`description`, () => {
  test(`initially unset`, () => {
    expect(state).toMatchObject({ description: BuilderKit.State.Values.unset }) // prettier-ignore
    expectTypeOf(state).toMatchTypeOf<{ description: { value: string | BuilderKit.State.Values.Unset }}>() // prettier-ignore
  })
  test(`set after method call`, () => {
    const state = BuilderKit.State.get(t.description(`foo`))
    expect(state).toMatchObject({ description: `foo` }) // prettier-ignore
    expectTypeOf(state).toMatchTypeOf<{ description: { value: 'foo' }}>() // prettier-ignore
  })
})
