import { describe, expect, expectTypeOf, test } from 'vitest'
import { enumeration } from './enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const m = [`a`] as const
const t = enumeration(m)

describe(`state`, () => {
  describe(`members`, () => {
    test(`constructor sets members`, () => {
      expect(BuilderKit.State.get(t)).toMatchObject({ members: [`a`] })
      expectTypeOf(BuilderKit.State.get(t).members.value).toMatchTypeOf<readonly ['a']>() // prettier-ignore
    })
  })
  describe(`description`, () => {
    test(`initially unset`, () => {
      expect(BuilderKit.State.get(t)).toMatchObject({
        description: BuilderKit.State.Values.unset,
      })
      expect(BuilderKit.State.get(t)).toMatchObject({
        description: BuilderKit.State.Values.unset,
      })
    })
    test(`set after method call`, () => {
      expect(BuilderKit.State.get(t.description(`foo`))).toMatchObject({
        description: `foo`,
      })
    })
  })
})
