import { describe, expect, expectTypeOf, test } from 'vitest'
import { ParameterBuilder } from './_.js'
import { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import { TypeBuilder } from '../TypeBuilder/_.js'

const b = TypeBuilder.boolean()
const s = TypeBuilder.string()
const n = TypeBuilder.number()
const p = ParameterBuilder

test(`has constructors: "name", "type"`, () => {
  expect(Object.entries(p).map((_) => [_[0], typeof _[1]])).toEqual([[`name`, `function`], [`type`,`function`]]) // prettier-ignore
})

describe(`name()`, () => {
  test(`sets name`, () => {
    const $p = p.name(`foo`)
    const state = BuilderKit.State.get($p)
    type state = BuilderKit.State.Get<typeof $p>
    expect(state.data.name).toEqual(`foo`)
    expectTypeOf<state['name']['value']>().toEqualTypeOf<`foo`>()
  })
})

describe(`type()`, () => {
  test(`sets type`, () => {
    const $p = p.type(b)
    const state = BuilderKit.State.get($p)
    type state = BuilderKit.State.Get<typeof $p>
    expect(state.data.typeBuilder).toEqual(b)
    expectTypeOf<state['typeBuilder']['value']>().toEqualTypeOf<typeof b>()
  })
})

describe(`default()`, () => {
  test(`not settable before type`, () => {
    // @ts-expect-error ignore
    p.name(`x`).default
  })
  test(`available after type`, () => {
    expectTypeOf(p.type(b).default).toMatchTypeOf<() => any>()
  })
  test(`accepts value of type of type`, () => {
    expectTypeOf(p.type(b).default).parameter(0).toEqualTypeOf<boolean | (() => boolean)>() // prettier-ignore
    expectTypeOf(p.type(s).default).parameter(0).toEqualTypeOf<string | (() => string)>() // prettier-ignore
    expectTypeOf(p.type(n).default).parameter(0).toEqualTypeOf<number | (() => number)>() // prettier-ignore
  })
  test(`state defaults to optional`, () => {
    const state = BuilderKit.State.get(p.type(b))
    expect(state.data.optionality).toMatchObject({ _tag: `optional` })
    type state = typeof state
    expectTypeOf<state['optionality']['valueDefault']>().toEqualTypeOf<{ _tag: 'optional' }>() // prettier-ignore
  })
  test(`sets default`, () => {
    const state = BuilderKit.State.get(p.type(b).default(true))
    expect(state.data.optionality).toMatchObject({ _tag: `default` }) // prettier-ignore
    expect(state.data.optionality.getValue()).toMatchObject(true) // prettier-ignore
    type state = typeof state
    expectTypeOf<state['optionality']['value']>().toEqualTypeOf<{ _tag: 'default'; getValue: () => boolean }>() // prettier-ignore
  })
})
