import { BuilderKit } from '../BuilderKit.js'
import { expect, test } from 'vitest'
import { Fixtures } from './_/fixtures.js'

test('minimal builder', () => {
  const initialState: BuilderKit.State.Initial<Fixtures.A. State> = { a: 'value' } // prettier-ignore
  const create = BuilderKit.createBuilder<Fixtures.A.State, Fixtures.A. BuilderFn, []>()({ initialState, implementation: () => ({}) }) // prettier-ignore
  const builder = create()
  const state = BuilderKit.State.get(builder)
  expect.soft(Object.keys(builder)).toEqual([])
  expect.soft(state).toEqual(initialState)
})

test('state is immutable', () => {
  const initialState: BuilderKit.State.Initial<Fixtures.B.State> = { a: 'value' } // prettier-ignore
  const create = BuilderKit.createBuilder<Fixtures.B.State, Fixtures.B.BuilderFn, []>()({ initialState, implementation: ({updater}) => ({ setA: updater('a') }) }) // prettier-ignore
  const builder = create()
  const state = BuilderKit.State.get(builder)
  const builder2 = builder.setA('foo')
  const state2 = BuilderKit.State.get(builder2)
  expect.soft(state).toMatchObject({})
  expect.soft(state2).toMatchObject({ a: 'foo' })
})
