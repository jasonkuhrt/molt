import { describe, expect, expectTypeOf, test } from 'vitest'
import { union } from './union.js'
import { string } from './string.js'
import { number } from './number.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const t = union([number, string])

describe(`state`, () => {
  describe(`members`, () => {
    test(`constructor sets members`, () => {
      expect(BuilderKit.State.get(t)).toMatchObject({
        members: [`a`],
      })
      expectTypeOf(BuilderKit.State.get(t).members.value).toMatchTypeOf<
        readonly string[]
      >()
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
