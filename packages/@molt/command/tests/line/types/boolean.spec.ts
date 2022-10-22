import { Command } from '../../../src/index.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

it(`implies true`, () => {
  const args = Command.create({ '--verbose': z.boolean() }).parse({ line: [`--verbose`] })
  assert<IsExact<{ verbose: boolean }, typeof args>>(true)
  expect(args).toMatchObject({ verbose: true })
})
it(`has a negated variant that implies false`, () => {
  const args = Command.create({ '--verbose': z.boolean() }).parse({ line: [`--no-verbose`] })
  assert<IsExact<{ verbose: boolean }, typeof args>>(true)
  expect(args).toMatchObject({ verbose: false })
})

describe(`when a parameter default is specified`, () => {
  it(`uses the default value when no input given`, () => {
    const args = Command.create({ '--verbose': z.boolean().default(false) }).parse({ line: [] })
    assert<IsExact<{ verbose: boolean }, typeof args>>(true)
    expect(args).toMatchObject({ verbose: false })
  })
  it(`accepts the negated parameter`, () => {
    const args = Command.create({ '--verbose': z.boolean().default(true) }).parse({ line: [`--no-verbose`] })
    assert<IsExact<{ verbose: boolean }, typeof args>>(true)
    expect(args).toMatchObject({ verbose: false })
  })
})

describe(`when parameter is optional`, () => {
  it(`allows no input to be given, resulting in undefined internally`, () => {
    const args = Command.create({ '--verbose': z.boolean().optional() })
      .settings({ helpOnNoArguments: false })
      .parse({ line: [] })
    assert<IsExact<{ verbose: boolean | undefined }, typeof args>>(true)
    expect(args).toMatchObject({ verbose: undefined })
  })
  it(`input can be given`, () => {
    const args = Command.create({ '--verbose': z.boolean().optional() }).parse({ line: [`--verbose`] })
    assert<IsExact<{ verbose: boolean | undefined }, typeof args>>(true)
    expect(args).toMatchObject({ verbose: true })
  })
})
