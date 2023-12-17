import { describe, expect, expectTypeOf, it } from 'vitest'
import { $, e, s } from './_/helpers.js'

const $$ = $.settings({ onError: `throw`, helpOnError: false })
let args

describe(`optional`, () => {
  it(`leads to optional type`, () => {
    const args = $.parametersExclusive(`method`, ($) =>
      $.parameter(`v version`, s).parameter(`b bump`, e).optional(),
    ).parse({ line: [`-v`, `1.0.0`] })
    expectTypeOf(args).toMatchTypeOf<{
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
    }>()
  })

  it(`can accept line arg`, () => {
    args = $.parametersExclusive(`method`, ($) =>
      $.parameter(`v version`, s).parameter(`b bump`, e).optional(),
    ).parse({
      line: [`-v`, `1.0.0`],
    })
    expect(args).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
  })

  it(`can accept env arg`, () => {
    args = $.parametersExclusive(`method`, ($) =>
      $.parameter(`v version`, s).parameter(`b bump`, e).optional(),
    ).parse({
      environment: { cli_param_v: `1.0.0` },
    })
    expect(args).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
  })
  it(`can accept nothing`, () => {
    args = $.parametersExclusive(`method`, ($) =>
      $.parameter(`v version`, s).parameter(`b bump`, e).optional(),
    ).parse()
    expect(`method` in args).toBe(false)
  })
  it(`if two args then error`, () => {
    expect(() =>
      $$.parametersExclusive(`method`, ($) =>
        $.parameter(`v version`, s).parameter(`b bump`, e).optional(),
      ).parse({
        line: [`-v`, `1.0.0`, `-b`, `major`],
      }),
    ).toThrowErrorMatchingSnapshot()
  })
})

describe(`required`, () => {
  it(`if no arg given then error`, () => {
    expect(
      $$.parametersExclusive(`method`, ($) =>
        $.parameter(`v version`, s).parameter(`b bump`, e),
      ).parse,
    ).toThrowErrorMatchingSnapshot()
  })
  it(`if two args then error`, () => {
    expect(() =>
      $$.parametersExclusive(`method`, ($$) =>
        $$.parameter(`v version`, s).parameter(`b bump`, e),
      ).parse({
        line: [`-v`, `1.0.0`, `-b`, `major`],
      }),
    ).toThrowErrorMatchingSnapshot()
  })
})

describe(`default`, () => {
  it(`method params are based on group params defined above`, () => {
    $.parametersExclusive(`method`, ($) => {
      const $$ = $.parameter(`v version`, s).parameter(`b bump`, e)
      const m1 = $$.default
      expectTypeOf<Parameters<typeof m1>>().toMatchTypeOf<[tag: 'version' | 'bump', value: 'any string']>() // prettier-ignore
      const m2 = $$.default<'version'>
      expectTypeOf<Parameters<typeof m2>>().toMatchTypeOf<[tag: 'version', value: 'any string']>() // prettier-ignore
      const m3 = $$.default<'bump'>
      expectTypeOf<Parameters<typeof m3>>().toMatchTypeOf<[tag: 'bump', value: 'patch' | 'minor' | 'major']>() // prettier-ignore
      return $$
    })
  })
  it(`leads to non-optional type`, () => {
    args = $$.parametersExclusive(`method`, ($) =>
      $.parameter(`v version`, s)
        .parameter(`b bump`, e)
        .default(`bump`, `major`),
    ).parse()
    expectTypeOf(args).toMatchTypeOf<{ method: { _tag: 'version'; value: string } | { _tag: 'bump'; value: 'major' | 'minor' | 'patch' }}>() // prettier-ignore
  })
  it(`used if nothing passed for group`, () => {
    args = $$.parametersExclusive(`method`, ($) =>
      $.parameter(`v version`, s)
        .parameter(`b bump`, e)
        .default(`bump`, `patch`),
    ).parse()
    expect(args.method).toMatchObject({ _tag: `bump`, value: `patch` })
  })
})
