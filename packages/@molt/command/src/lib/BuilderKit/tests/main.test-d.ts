import { BuilderKit } from '../BuilderKit.js'
import { PrivateData } from '../../PrivateData/PrivateData.js'
import { describe, expectTypeOf, test } from 'vitest'
import { Fixtures } from './_/fixtures.js'

describe('Empty builder', () => {
  const create1 = BuilderKit.createBuilder<Fixtures.A.State, Fixtures.A.BuilderFn, []>() // prettier-ignore
  const create2 = create1({ initialState:{}, implementation: () => ({}) }) // prettier-ignore

  test('constructor params', () => {
    expectTypeOf(create1)
      .parameter(0)
      .toHaveProperty('initialState')
      .toEqualTypeOf<{}>()

    // expectTypeOf(create1)
    //   .parameter(0)
    //   .toHaveProperty('implementation')
    //   .returns.toMatchTypeOf<2>()

    // expectTypeOf(create1)
    //   .parameter(0)
    //   .toHaveProperty('implementation')
    //   .toMatchTypeOf<
    //     (params: {
    //       state: { a: string | typeof PrivateData.Values.unsetSymbol }
    //       updater: BuilderKit.Updater<Fixtures.B.State, BuilderKit.BuilderToStaticReturn<Fixtures.B.Builder>>
    //     }) => BuilderKit.BuilderToStaticReturn<BuilderKit.BuilderToPublic<Fixtures.B.Builder>>
    //   >()
  })

  test('initial state', () => {
    const builder = create2()
    expectTypeOf<BuilderKit.StateRemove<typeof builder>>().toEqualTypeOf({})
    const state = BuilderKit.State.get(builder)
    expectTypeOf(state).toEqualTypeOf<Fixtures.A.State>()
  })
})

describe('Simple builder', async () => {
  const initialState: BuilderKit.State.RuntimeData<Fixtures.B.State> = { a: 'value' } // prettier-ignore
  const create1 = BuilderKit.createBuilder<Fixtures.B.State, Fixtures.B.BuilderFn, []>() // prettier-ignore
  // const create2 = create1({ initialState, implementation: () => ({}) }) // prettier-ignore

  test('param implementation updater', () => {
    const create2 = create1({
      initialState,
      implementation: ({ updater }) => {
        expectTypeOf(updater).parameter(0).toBeString()
        expectTypeOf(updater('a')).toMatchTypeOf<(value: string) => BuilderKit.Builder.ToStaticInterface<Fixtures.B.Builder>>() // prettier-ignore
        expectTypeOf(updater('b')).parameter(0).toBeNever() // TODO make typos a type error
        return {
          setA: updater('a'),
        }
      },
    })
    expectTypeOf(create1).parameter(0).toHaveProperty('implementation').returns
      .toMatchTypeOf<
      BuilderKit.BuilderToStaticReturn<
        BuilderKit.StateRemove<Fixtures.B.Builder>
      >
    >
  })
})
