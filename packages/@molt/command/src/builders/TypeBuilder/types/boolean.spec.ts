import { describe, expect, test } from 'vitest'
import { boolean } from './boolean.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

describe(`description`, () => {
  test(`starts unset`, () => {
    expect(BuilderKit.State.get(boolean())).toMatchObject({
      description: BuilderKit.State.Values.unset,
    })
  })
  test(`can have a description`, () => {
    expect(BuilderKit.State.get(boolean().description(`foo`))).toMatchObject({
      description: `foo`,
    })
  })
})
