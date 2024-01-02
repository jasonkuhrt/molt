import { BuilderKit } from '../BuilderKit.js'
import { describe, expectTypeOf, test } from 'vitest'
import type { Fixtures } from './_/fixtures.js'

describe(`Empty builder`, () => {
  interface Builder {
    state: Fixtures.A.State
    chain: Fixtures.A.ChainFn
    resolve: null
    constructor: null
  }
  const create1 = BuilderKit.createBuilder<Builder>() // prettier-ignore
  const create2 = create1({ initialState:{}, implementation: () => ({}) }) // prettier-ignore

  test(`constructor params`, () => {
    expectTypeOf(create1)
      .parameter(0)
      .toHaveProperty(`initialState`)
      .toEqualTypeOf<{}>()

    expectTypeOf(create1)
      .parameter(0)
      // todo we could make this be gone, there are no methods...
      .toHaveProperty(`implementation`)
      .toMatchTypeOf<
        (params: {
          state: {}
          // todo we could make updater gone here, there is no state...
          updater: (property: string) => () => Fixtures.A.BuilderStatic
          recurse: (state: {}) => Fixtures.A.BuilderStatic
        }) => Fixtures.A.BuilderStatic
      >()
  })

  test(`initial state`, () => {
    const builder = create2()
    expectTypeOf<BuilderKit.StateRemove<typeof builder>>().toEqualTypeOf({})
    const state = BuilderKit.State.get(builder)
    expectTypeOf(state).toEqualTypeOf<Fixtures.A.State>()
  })
})

describe(`Simple builder`, async () => {
  interface Builder {
    state: Fixtures.B.State
    chain: Fixtures.B.ChainFn
    resolve: null
    constructor: null
  }
  const initialState: BuilderKit.State.RuntimeData<Fixtures.B.State> = { a: `value` } // prettier-ignore
  const create1 = BuilderKit.createBuilder<Builder>() // prettier-ignore

  test(`param implementation updater`, () => {
    create1({
      initialState,
      implementation: ({ updater }) => {
        expectTypeOf(updater).parameter(0).toBeString()
        expectTypeOf(updater(`a`)).toMatchTypeOf<(value: string) => Fixtures.B.BuilderStatic>() // prettier-ignore
        expectTypeOf(updater(`b`)).parameter(0).toBeNever() // TODO make typos a type error
        return {
          setA: updater(`a`),
        }
      },
    })
    expectTypeOf(create1).parameter(0).toHaveProperty(`implementation`).returns
      .toMatchTypeOf<Fixtures.B.BuilderStatic>
  })
})

describe(`builder with constructor params`, () => {
  // todo test with non-empty constructor params
})
