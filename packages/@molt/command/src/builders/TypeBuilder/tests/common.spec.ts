import { describe, expect, expectTypeOf, test } from 'vitest'
import type { TypeBuilderString } from '../types/string.js'
import { string } from '../types/string.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { TypeBuilderNumber } from '../types/number.js'
import { number } from '../types/number.js'
import { boolean, type TypeBuilderBoolean } from '../types/boolean.js'
import type { TypeBuilderUnion } from '../types/union.js'
import { union } from '../types/union.js'
import type { TypeBuilderEnumeration } from '../types/enumeration.js'
import { enumeration } from '../types/enumeration.js'

const common = (
  typeBuilderConstructor: () =>
    | TypeBuilderString
    | TypeBuilderNumber
    | TypeBuilderBoolean
    | TypeBuilderUnion
    | TypeBuilderEnumeration,
) => {
  const t = typeBuilderConstructor()
  const state = BuilderKit.State.get(t)

  describe(state.name, () => {
    describe(`description`, () => {
      test(`method returning self`, () => {
        expectTypeOf(t).toMatchTypeOf<{ description: (value: string) => typeof t }>() // prettier-ignore
      })
      test(`initially unset`, () => {
        expect(state.data.description).toEqual(BuilderKit.State.Values.unset) // prettier-ignore
      })
      test(`set after method call`, () => {
        expect(BuilderKit.State.get(t.description(`foo`)).data.description).toEqual(`foo`) // prettier-ignore
      })
      test(`immutably reset after second method call`, () => {
        const t2 = t.description(`foo`)
        type t2 = typeof t2
        expect(BuilderKit.State.get(t2).data.description).toEqual(`foo`) // prettier-ignore
        expectTypeOf<BuilderKit.State.Get<t2>['data']['description']['value']>().toMatchTypeOf<'foo'>() // prettier-ignore
        const t3 = t2.description(`bar`)
        type t3 = typeof t3
        expect(BuilderKit.State.get(t3).data.description).toEqual(`bar`) // prettier-ignore
        expectTypeOf(BuilderKit.State.get(t3).data.description).toEqualTypeOf<'bar'>() // prettier-ignore
        expectTypeOf<BuilderKit.State.Get<t3>['data']['description']['value']>().toMatchTypeOf<'bar'>() // prettier-ignore
      })
    })
  })
}

common(string)
common(number)
common(boolean)
common(() => union([string(), number()]))
common(() => enumeration([`a`, `b`]))
