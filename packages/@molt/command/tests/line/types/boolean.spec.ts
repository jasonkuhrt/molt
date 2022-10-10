import { Command } from '../../../src/index.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

it(`implies true`, () => {
  const args = Command.create({ '--verbose': z.boolean() }).parseOrThrow([`--verbose`])
  assert<IsExact<{ verbose: boolean }, typeof args>>(true)
  expect(args).toEqual({ verbose: true })
})
it(`has a negated variant that implies false`, () => {
  const args = Command.create({ '--verbose': z.boolean() }).parseOrThrow([`--no-verbose`])
  assert<IsExact<{ verbose: boolean }, typeof args>>(true)
  expect(args).toEqual({ verbose: false })
})

describe(`when a parameter default is specified`, () => {
  it(`uses the default value when no input given`, () => {
    const args = Command.create({ '--verbose': z.boolean().default(false) }).parseOrThrow([])
    assert<IsExact<{ verbose: boolean }, typeof args>>(true)
    expect(args).toEqual({ verbose: false })
  })
  it(`accepts the negated parameter`, () => {
    const args = Command.create({ '--verbose': z.boolean().default(true) }).parseOrThrow([`--no-verbose`])
    assert<IsExact<{ verbose: boolean }, typeof args>>(true)
    expect(args).toEqual({ verbose: false })
  })
})

describe(`when parameter is optional`, () => {
  it(`allows no input to be given, resulting in undefined internally`, () => {
    const args = Command.create({ '--verbose': z.boolean().optional() }).parseOrThrow([])
    assert<IsExact<{ verbose: boolean | undefined }, typeof args>>(true)
    expect(args).toEqual({ verbose: undefined })
  })
  it(`input can be given`, () => {
    const args = Command.create({ '--verbose': z.boolean().optional() }).parseOrThrow([`--verbose`])
    assert<IsExact<{ verbose: boolean | undefined }, typeof args>>(true)
    expect(args).toEqual({ verbose: true })
  })
})