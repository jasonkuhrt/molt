import { describe, expect, expectTypeOf, test } from 'vitest'
import { number } from './number.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const n = number()
const state = BuilderKit.State.get(n)

describe(`description`, () => {
  test(`method returning self`, () => {
    expectTypeOf(n).toMatchTypeOf<{ description: (value: string) => typeof n }>() // prettier-ignore
  })
  test(`initially unset`, () => {
    expect(state.data).toEqual({ description: BuilderKit.State.Values.unset }) // prettier-ignore
  })
  test(`set after method call`, () => {
    expect(BuilderKit.State.get(n.description(`foo`)).data.description).toEqual(`foo`) // prettier-ignore
  })
  test(`immutably reset after second method call`, () => {
    const t2 = n.description(`foo`)
    type t2 = typeof t2
    expect(BuilderKit.State.get(t2).data.description).toEqual(`foo`) // prettier-ignore
    expectTypeOf<BuilderKit.State.Get<t2>['data']['description']['value']>().toMatchTypeOf<'foo'>() // prettier-ignore
    const t3 = t2.description(`bar`)
    type t3 = typeof t3
    expect(BuilderKit.State.get(t3).data.description).toEqual(`bar`) // prettier-ignore
    expectTypeOf(BuilderKit.State.get(t3).data.description).toEqualTypeOf<'bar'>() // prettier-ignore
    expectTypeOf<BuilderKit.State.Get<t3>['data']['description']['value']>().toMatchTypeOf<'bar'>() // prettier-ignore
  })
})
