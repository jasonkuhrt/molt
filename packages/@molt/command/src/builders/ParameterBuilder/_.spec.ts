import { describe, expect, expectTypeOf, test } from 'vitest'
import { ParameterBuilder } from './_.js'
import { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import { TypeBuilder } from '../TypeBuilder/_.js'
import type { OptionalityOptional } from '../../Type/helpers.js'

const b = TypeBuilder.boolean()
const s = TypeBuilder.string()
const n = TypeBuilder.number()
const p = ParameterBuilder

test(`has constructors: "name", "type"`, () => {
  const properties = Object.entries(p).map((_) => ({name:_[0], type:typeof _[1]})) // prettier-ignore
  expect(properties).toEqual([{name:`name`, type:`function`}, {name:`type`,type:`function`}]) // prettier-ignore
})

describe(`name()`, () => {
  test(`sets name`, () => {
    const $p = p.name(`foo`)
    const state = BuilderKit.State.get($p)
    type state = BuilderKit.State.Get<typeof $p>
    expect(state.data.name).toEqual(`foo`)
    expectTypeOf<state['data']['name']['value']>().toEqualTypeOf<`foo`>()
  })
})

describe(`type()`, () => {
  test(`sets type`, () => {
    const $p = p.type(b)
    const state = BuilderKit.State.get($p)
    type state = BuilderKit.State.Get<typeof $p>
    expect(state.data.typeBuilder).toEqual(b)
    expectTypeOf<state['data']['typeBuilder']['value']>().toEqualTypeOf<typeof b>() // prettier-ignore
  })
})

describe(`default()`, () => {
  describe(`availability`, () => {
    test(`not before type specified`, () => {
      // @ts-expect-error ignore
      p.name(`x`).default
    })
    test(`is after type specified`, () => {
      expectTypeOf(p.type(b).default).toMatchTypeOf<() => any>()
    })
  })
  describe(`input`, () => {
    test(`accepts value of type of specified type`, () => {
      expectTypeOf(p.type(b).default).parameter(0).toEqualTypeOf<boolean | (() => boolean)>() // prettier-ignore
      expectTypeOf(p.type(s).default).parameter(0).toEqualTypeOf<string | (() => string)>() // prettier-ignore
      expectTypeOf(p.type(n).default).parameter(0).toEqualTypeOf<number | (() => number)>() // prettier-ignore
    })
  })
  describe(`state`, () => {
    test(`default for "default" is optional`, () => {
      const $ = p.type(b)
      const state = BuilderKit.State.get($)
      type state = typeof state
      type State = BuilderKit.State.Get<typeof $>
      expect(state.data.optionality._tag).toEqual(`optional`)
      expectTypeOf<state['data']['optionality']>().toEqualTypeOf<{ _tag: 'optional' }>() // prettier-ignore
      expectTypeOf<State['data']['optionality']['valueDefault']>().toEqualTypeOf<OptionalityOptional>() // prettier-ignore
    })
    test(`sets "default"`, () => {
      const $ = p.type(b).default(true)
      const state = BuilderKit.State.get($)
      type state = typeof state
      type State = BuilderKit.State.Get<typeof $>
      expect(state.data.optionality._tag).toEqual(`default`) // prettier-ignore
      expect(state.data.optionality.getValue()).toEqual(true) // prettier-ignore
      expectTypeOf<state['data']['optionality']>().toEqualTypeOf<{ _tag: 'default'; getValue: () => true }>() // prettier-ignore
      expectTypeOf<State['data']['optionality']['value']>().toEqualTypeOf<{ _tag: 'default'; getValue: () => true }>() // prettier-ignore
    })
  })
})
