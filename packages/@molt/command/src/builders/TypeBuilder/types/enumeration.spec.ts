import { describe, expect, expectTypeOf, test } from 'vitest'
import { enumeration } from './enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const m = [`a`] as const
const t = enumeration(m)

describe(`state`, () => {
  describe(`members`, () => {
    test(`constructor sets members`, () => {
      expect(BuilderKit.State.get(t).data.members).toEqual([`a`])
      expectTypeOf(BuilderKit.State.get(t).data.members).toMatchTypeOf<readonly ['a']>() // prettier-ignore
    })
  })
})
