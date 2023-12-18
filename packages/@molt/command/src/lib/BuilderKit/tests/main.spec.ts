import { BuilderKit } from '../BuilderKit.js'
import { describe, expect, test } from 'vitest'
import { Fixtures } from './_/fixtures.js'

test('initial state', () => {
  const initialState: BuilderKit.State.RuntimeData<Fixtures.A. State> = { a: 'value' } // prettier-ignore
  const create = BuilderKit.createBuilder<Fixtures.A.State, Fixtures.A. BuilderFn, []>()({ initialState, implementation: () => ({}) }) // prettier-ignore
  const builder = create()
  const state = BuilderKit.State.get(builder)
  expect.soft(Object.keys(builder)).toEqual([])
  expect.soft(state).toEqual(initialState)
})

test('state is immutable', () => {
  const initialState: BuilderKit.State.RuntimeData<Fixtures.B.State> = { a: 'value' } // prettier-ignore
  const create = BuilderKit.createBuilder<Fixtures.B.State, Fixtures.B.BuilderFn, []>()({ initialState, implementation: ({updater}) => ({ setA: updater('a') }) }) // prettier-ignore
  const builder = create()
  const state = BuilderKit.State.get(builder)
  const builder2 = builder.setA('foo')
  const state2 = BuilderKit.State.get(builder2)
  expect.soft(state).toMatchObject({})
  expect.soft(state2).toMatchObject({ a: 'foo' })
})

describe('state updaters', () => {
  const initialState: BuilderKit.State.RuntimeData<Fixtures.B.State> = { a: 'value' } // prettier-ignore
  const create1 = BuilderKit.createBuilder<
    Fixtures.B.State,
    Fixtures.B.BuilderFn,
    []
  >()

  test('can be a custom function', () => {
    const create = create1({
      initialState,
      implementation: ({ state, recurse }) => ({
        setA: (value) => recurse({ ...state, a: value + 'bar' }),
      }),
    })
    const state = BuilderKit.State.get(create().setA('foo'))
    expect.soft(state).toMatchObject({ a: 'foobar' })
  })
  test('can use the updater factory', () => {
    const create = create1({
      initialState,
      implementation: ({ updater }) => ({
        setA: updater('a'),
      }),
    })
    const state = BuilderKit.State.get(create().setA('foo'))
    expect.soft(state).toMatchObject({ a: 'foo' })
  })
  test('can use the updater factory with a custom transformer', () => {
    const create = create1({
      initialState,
      implementation: ({ updater }) => ({
        setA: updater('a', (value) => value + 'bar'),
      }),
    })
    const state = BuilderKit.State.get(create().setA('foo'))
    expect.soft(state).toMatchObject({ a: 'foobar' })
  })
})
