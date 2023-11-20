import { expectType } from 'tsd'
import { describe, expect, it } from 'vitest'
import { $, as, e, s } from './_/helpers.js'

const $$ = $.settings({ onError: `throw`, helpOnError: false })
let args

describe(`optional`, () => {
  it(`leads to optional type`, () => {
    const args = $.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e).optional())
      .parse({ line: [`-v`, `1.0.0`] })
    expectType<typeof args>(
      as<{
        method:
          | {
            _tag: 'version'
            value: string
          }
          | {
            _tag: 'bump'
            value: 'major' | 'minor' | 'patch'
          }
          | undefined
      }>(),
    )
  })

  it(`can accept line arg`, () => {
    args = $.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e).optional()).parse({
      line: [`-v`, `1.0.0`],
    })
    expect(args).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
  })

  it(`can accept env arg`, () => {
    args = $.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e).optional()).parse({
      environment: { cli_param_v: `1.0.0` },
    })
    expect(args).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
  })
  it(`can accept nothing`, () => {
    args = $.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e).optional())
      .parse()
    expect(`method` in args).toBe(false)
  })
  it(`if two args then error`, () => {
    expect(() =>
      $$.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e).optional()).parse({
        line: [`-v`, `1.0.0`, `-b`, `major`],
      })
    ).toThrowErrorMatchingSnapshot()
  })
})

describe(`required`, () => {
  it(`if no arg given then error`, () => {
    expect(
      $$.parametersExclusive(`method`, ($) => $.parameter(`v version`, s).parameter(`b bump`, e)).parse,
    ).toThrowErrorMatchingSnapshot()
  })
  it(`if two args then error`, () => {
    expect(() =>
      $$.parametersExclusive(`method`, ($$) => $$.parameter(`v version`, s).parameter(`b bump`, e)).parse({
        line: [`-v`, `1.0.0`, `-b`, `major`],
      })
    ).toThrowErrorMatchingSnapshot()
  })
})

describe(`default`, () => {
  it(`method params are based on group params defined above`, () => {
    $.parametersExclusive(`method`, ($) => {
      const $$ = $.parameter(`v version`, s).parameter(`b bump`, e)
      const m1 = $$.default
      expectType<Parameters<typeof m1>>(as<[tag: 'version' | 'bump', value: 'any string']>())
      const m2 = $$.default<'version'>
      expectType<Parameters<typeof m2>>(as<[tag: 'version', value: 'any string']>())
      const m3 = $$.default<'bump'>
      expectType<Parameters<typeof m3>>(as<[tag: 'bump', value: 'patch' | 'minor' | 'major']>())
      return $$
    })
  })
  it(`leads to non-optional type`, () => {
    args = $$.parametersExclusive(
      `method`,
      ($) => $.parameter(`v version`, s).parameter(`b bump`, e).default(`bump`, `major`),
    ).parse()
    expectType<typeof args>(
      as<{
        method:
          | {
            _tag: 'version'
            value: string
          }
          | {
            _tag: 'bump'
            value: 'major' | 'minor' | 'patch'
          }
      }>(),
    )
  })
  it(`used if nothing passed for group`, () => {
    args = $$.parametersExclusive(
      `method`,
      ($) => $.parameter(`v version`, s).parameter(`b bump`, e).default(`bump`, `patch`),
    ).parse()
    expect(args.method).toMatchObject({ _tag: `bump`, value: `patch` })
  })
})
