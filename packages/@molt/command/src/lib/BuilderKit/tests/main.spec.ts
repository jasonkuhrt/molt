import { BuilderKit } from '../BuilderKit.js'
import { describe, expect, expectTypeOf, test } from 'vitest'
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
    expect.soft(Object.keys(builder)).toEqual([])
    const state = BuilderKit.State.get(builder)
    expectTypeOf(state).toEqualTypeOf<{ data: {}; resolve: () => null }>()
    expect.soft(state).toEqual({ data: {}, resolve: BuilderKit.defaults.resolve }) // prettier-ignore
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

test(`state is immutable`, () => {
  interface Builder {
    state: Fixtures.B.State
    chain: Fixtures.B.ChainFn
    resolve: null
    constructor: null
  }
  const initialState: BuilderKit.State.RuntimeData<Fixtures.B.State> = { a: `value` } // prettier-ignore
  const create = BuilderKit.createBuilder<Builder>()({ initialState, implementation: ({updater}) => ({ setA: updater(`a`) }) }) // prettier-ignore
  const builder = create()
  const state = BuilderKit.State.get(builder)
  const builder2 = builder.setA(`foo`)
  const state2 = BuilderKit.State.get(builder2)
  expect.soft(state.data).toMatchObject({})
  expect.soft(state2.data).toMatchObject({ a: `foo` })
})

describe(`state updaters`, () => {
  interface Builder {
    state: Fixtures.B.State
    chain: Fixtures.B.ChainFn
    resolve: null
    constructor: null
  }
  const initialState: BuilderKit.State.RuntimeData<Fixtures.B.State> = { a: `value` } // prettier-ignore
  const create1 = BuilderKit.createBuilder<Builder>()

  test(`can be a custom function`, () => {
    const create = create1({
      initialState,
      implementation: ({ state, recurse }) => ({
        setA: (value) => recurse({ ...state, a: value + `bar` }),
      }),
    })
    const state = BuilderKit.State.get(create().setA(`foo`))
    expect.soft(state).toMatchObject({ a: `foobar` })
  })
  test(`can use the updater factory`, () => {
    const create = create1({
      initialState,
      implementation: ({ updater }) => ({
        setA: updater(`a`),
      }),
    })
    const state = BuilderKit.State.get(create().setA(`foo`))
    expect.soft(state.data).toMatchObject({ a: `foo` })
  })
  test(`can use the updater factory with a custom transformer`, () => {
    const create = create1({
      initialState,
      implementation: ({ updater }) => ({
        setA: updater(`a`, (value) => value + `bar`),
      }),
    })
    const state = BuilderKit.State.get(create().setA(`foo`))
    expect.soft(state.data).toMatchObject({ a: `foobar` })
  })
})

// todo test with non-empty constructor params
// describe(`builder with constructor params`, () => {
// })
