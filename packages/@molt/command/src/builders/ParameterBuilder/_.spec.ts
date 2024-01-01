import { describe, expect, expectTypeOf, test } from 'vitest'
import { ParameterBuilder } from './_.js'
import { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import { TypeBuilder } from '../TypeBuilder/_.js'

const p = ParameterBuilder

test(`has constructors: "name", "type"`, () => {
  expect(Object.entries(p).map((_) => [_[0], typeof _[1]])).toEqual([[`name`, `function`], [`type`,`function`]]) // prettier-ignore
})

describe(`name`, () => {
  test(`sets name`, () => {
    const $p = p.name(`foo`)
    const state = BuilderKit.State.get($p)
    type state = BuilderKit.State.Get<typeof $p>
    expect(state.name).toMatchObject(`foo`)
    expectTypeOf<state['name']['value']>().toEqualTypeOf<`foo`>()
  })
})

describe(`type`, () => {
  test(`sets type`, () => {
    const b = TypeBuilder.boolean()
    const $p = p.type(b)
    const state = BuilderKit.State.get($p)
    type state = BuilderKit.State.Get<typeof $p>
    expect(state.typeBuilder).toMatchObject(b)
    expectTypeOf<state['typeBuilder']['value']>().toEqualTypeOf<typeof b>()
  })
})
