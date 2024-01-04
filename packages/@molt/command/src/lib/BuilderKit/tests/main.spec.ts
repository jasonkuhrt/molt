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
  const create2 = create1({ initialData:{}, implementation: () => ({}) }) // prettier-ignore

  test(`constructor params`, () => {
    expectTypeOf(create1).parameter(0).toHaveProperty(`initialData`).toEqualTypeOf<{}>() // prettier-ignore
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
    expectTypeOf(state).toEqualTypeOf<{ name:string; data: {}; resolve: typeof BuilderKit.defaults.resolve }>() // prettier-ignore
    expect(state).toEqual({ name:`anonymous`, data: {}, resolve: BuilderKit.defaults.resolve }) // prettier-ignore
  })
  test(`can be given name`, () => {
    const builder = create1({ name:`foo`, initialData:{}, implementation: () => ({})})() // prettier-ignore
    const state = BuilderKit.State.get(builder)
    expect(state.name).toEqual(`foo`)
  })
})

describe(`Simple builder`, async () => {
  interface Builder {
    state: Fixtures.B.State
    chain: Fixtures.B.ChainFn
    resolve: null
    constructor: null
  }
  const initialData: BuilderKit.State.RuntimeData<Fixtures.B.State> = { a: `value` } // prettier-ignore
  const create1 = BuilderKit.createBuilder<Builder>() // prettier-ignore

  test(`param implementation updater`, () => {
    create1({
      initialData,
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
  const initialData: BuilderKit.State.RuntimeData<Fixtures.B.State> = { a: `value` } // prettier-ignore
  const create = BuilderKit.createBuilder<Builder>()({ initialData, implementation: ({updater}) => ({ setA: updater(`a`) }) }) // prettier-ignore
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
  const initialData: BuilderKit.State.RuntimeData<Fixtures.B.State> = { a: `value` } // prettier-ignore
  const create1 = BuilderKit.createBuilder<Builder>()

  test(`can be a custom function`, () => {
    const create = create1({
      initialData,
      implementation: ({ state, recurse }) => ({
        setA: (value) => recurse({ ...state, a: value + `bar` }),
      }),
    })
    const state = BuilderKit.State.get(create().setA(`foo`))
    expect.soft(state).toMatchObject({ a: `foobar` })
  })
  test(`can use the updater factory`, () => {
    const create = create1({
      initialData,
      implementation: ({ updater }) => ({
        setA: updater(`a`),
      }),
    })
    const state = BuilderKit.State.get(create().setA(`foo`))
    expect.soft(state.data).toMatchObject({ a: `foo` })
  })
  test(`can use the updater factory with a custom transformer`, () => {
    const create = create1({
      initialData,
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
