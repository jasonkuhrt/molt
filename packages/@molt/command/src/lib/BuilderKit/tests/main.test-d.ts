import { BuilderKit } from '../BuilderKit.js'
import { PrivateData } from '../../PrivateData/PrivateData.js'
import { describe, expectTypeOf, test } from 'vitest'
import { Fixtures } from './_/fixtures.js'

describe('minimal', () => {
  const initialState: BuilderKit.State.Initial<Fixtures.A.State> = { a: 'value' } // prettier-ignore
  const create1 = BuilderKit.createBuilder<Fixtures.A.State, Fixtures.A.BuilderFn, []>() // prettier-ignore
  const create2 = create1({ initialState, implementation: () => ({}) }) // prettier-ignore

  test('constructor params', () => {
    expectTypeOf(create1)
      .parameter(0)
      .toHaveProperty('initialState')
      .toEqualTypeOf<{ a: string | BuilderKit.State.Values.Unset }>()
    expectTypeOf(create1)
      .parameter(0)
      .toHaveProperty('implementation')
      .toMatchTypeOf<
        (params: {
          state: { a: string | typeof PrivateData.Values.unsetSymbol }
          updater: BuilderKit.Updater<Fixtures.A.State>
        }) => object
      >()
  })

  test('initial state', () => {
    const builder = create2()
    expectTypeOf<BuilderKit.PublicType<typeof builder>>().toEqualTypeOf({})
    const state = BuilderKit.State.get(builder)
    expectTypeOf(state).toEqualTypeOf<Fixtures.A.State>()
  })
})
