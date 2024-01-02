import { BuilderKit } from '../BuilderKit.js'
import { describe, expect, test } from 'vitest'
import type { Fixtures } from './_/fixtures.js'

test(`initial state`, () => {
  interface Builder {
    state: Fixtures.A.State
    chain: Fixtures.A.ChainFn
    resolve: null
    constructor: null
  }
  const initialState: BuilderKit.State.RuntimeData<Fixtures.A. State> = { a: `value` } // prettier-ignore
  const create = BuilderKit.createBuilder<Builder>()({ initialState, implementation: () => ({}) }) // prettier-ignore
  const builder = create()
  const state = BuilderKit.State.get(builder)
  expect.soft(Object.keys(builder)).toEqual([])
  expect.soft(state).toEqual(initialState)
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
    expect.soft(state).toMatchObject({ a: `foo` })
  })
  test(`can use the updater factory with a custom transformer`, () => {
    const create = create1({
      initialState,
      implementation: ({ updater }) => ({
        setA: updater(`a`, (value) => value + `bar`),
      }),
    })
    const state = BuilderKit.State.get(create().setA(`foo`))
    expect.soft(state).toMatchObject({ a: `foobar` })
  })
})

// todo test with non-empty constructor params
// describe(`builder with constructor params`, () => {
// })
