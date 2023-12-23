import { describe, expect, test } from 'vitest'
import { enumeration } from './enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const m = [`a`]

describe(`members`, () => {
  test(`constructor sets members`, () => {
    expect(BuilderKit.State.get(enumeration(m))).toMatchObject({
      members: [`a`],
    })
  })
})

describe(`description`, () => {
  test(`starts unset`, () => {
    expect(BuilderKit.State.get(enumeration(m))).toMatchObject({
      description: BuilderKit.State.Values.unset,
    })
  })
  test(`can have a description`, () => {
    expect(
      BuilderKit.State.get(enumeration(m).description(`foo`)),
    ).toMatchObject({
      description: `foo`,
    })
  })
})
