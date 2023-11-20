import { $, b } from '../../_/helpers.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'

it(`implies true`, () => {
  const args = $.parameter(`--verbose`, b).parse({ line: [`--verbose`] })
  assert<IsExact<{ verbose: boolean }, typeof args>>(true)
  expect(args).toMatchObject({ verbose: true })
})

it(`has a negated variant that implies false`, () => {
  const args = $.parameter(`--verbose`, b).parse({ line: [`--no-verbose`] })
  assert<IsExact<{ verbose: boolean }, typeof args>>(true)
  expect(args).toMatchObject({ verbose: false })
})

describe(`when a parameter default is specified`, () => {
  it(`uses the default value when no input given`, () => {
    const args = $.parameter(`--verbose`, b.default(false)).parse({ line: [] })
    assert<IsExact<{ verbose: boolean }, typeof args>>(true)
    expect(args).toMatchObject({ verbose: false })
  })
  it(`accepts the negated parameter`, () => {
    const args = $.parameter(`--verbose`, b.default(true)).parse({
      line: [`--no-verbose`],
    })
    assert<IsExact<{ verbose: boolean }, typeof args>>(true)
    expect(args).toMatchObject({ verbose: false })
  })
})

describe(`when parameter is optional`, () => {
  it(`allows no input to be given, resulting in omitted key`, () => {
    const args = $.parameter(`--verbose`, b.optional())
      .settings({ helpOnNoArguments: false })
      .parse({ line: [] })
    assert<IsExact<{ verbose: boolean | undefined }, typeof args>>(true)
    expect(Object.keys(args)).not.toContain(`verbose`)
  })
  it(`input can be given`, () => {
    const args = $.parameter(`--verbose`, b.optional()).parse({ line: [`--verbose`] })
    assert<IsExact<{ verbose: boolean | undefined }, typeof args>>(true)
    expect(args).toMatchObject({ verbose: true })
  })
})
