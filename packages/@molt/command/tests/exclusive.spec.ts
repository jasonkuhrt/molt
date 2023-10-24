import type { Settings } from '../src/index.js'
import { Command } from '../src/index.js'
import { as, e, s } from './_/helpers.js'
import { expectType } from 'tsd'
import { describe, expect, it } from 'vitest'

let c
const settings: Settings.Input = { onError: `throw`, helpOnError: false }

describe(`optional`, () => {
  it(`leads to optional type`, () => {
    c = Command.create()
      .parametersExclusive(`method`, ($$) => $$.parameter(`v version`, s).parameter(`b bump`, e).optional())
      .parse({ line: [`-v`, `1.0.0`] })

    expectType<typeof c>(
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
    c = Command.create()
      .parametersExclusive(`method`, ($$) => $$.parameter(`v version`, s).parameter(`b bump`, e).optional())
      .parse({ line: [`-v`, `1.0.0`] })
    expect(c).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
  })

  it(`can accept env arg`, () => {
    c = Command.create()
      .parametersExclusive(`method`, ($$) => $$.parameter(`v version`, s).parameter(`b bump`, e).optional())
      .parse({ environment: { cli_param_v: `1.0.0` } })
    expect(c).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
  })
  it(`can accept nothing`, () => {
    c = Command.create()
      .parametersExclusive(`method`, ($$) => $$.parameter(`v version`, s).parameter(`b bump`, e).optional())
      .parse()
    expect(`method` in c).toBe(false)
  })
  it(`if two args then error`, () => {
    const c = Command.create()
      .parametersExclusive(`method`, ($$) => $$.parameter(`v version`, s).parameter(`b bump`, e).optional())
      .settings(settings)
    expect(() => c.parse({ line: [`-v`, `1.0.0`, `-b`, `major`] })).toThrowErrorMatchingSnapshot()
  })
})

describe(`required`, () => {
  it(`if no arg given then error`, () => {
    const c = Command.create()
      .parametersExclusive(`method`, ($$) => $$.parameter(`v version`, s).parameter(`b bump`, e))
      .settings(settings)
    expect(c.parse).toThrowErrorMatchingSnapshot()
  })
  it(`if two args then error`, () => {
    const c = Command.create()
      .parametersExclusive(`method`, ($$) => $$.parameter(`v version`, s).parameter(`b bump`, e))
      .settings(settings)
    expect(() => c.parse({ line: [`-v`, `1.0.0`, `-b`, `major`] })).toThrowErrorMatchingSnapshot()
  })
})

describe(`default`, () => {
  it(`method params are based on group params defined above`, () => {
    // prettier-ignore
    Command.create().parametersExclusive(`method`, ($$) => {
      const c = $$.parameter(`v version`, s).parameter(`b bump`, e)
      const m1 = c.default 
      expectType<Parameters<typeof m1>>(as<[tag: 'version' | 'bump', value: 'any string']>())
      const m2 = c.default<'version'>
      expectType<Parameters<typeof m2>>(as<[tag: 'version', value: 'any string']>())
      const m3 = c.default<'bump'>
      expectType<Parameters<typeof m3>>(as<[tag: 'bump', value: 'patch'|'minor'|'major']>())
      return c
    })
  })
  it(`leads to non-optional type`, () => {
    const a = Command.create()
      .parametersExclusive(`method`, ($$) =>
        $$.parameter(`v version`, s).parameter(`b bump`, e).default(`bump`, `major`),
      )
      .settings(settings)
      .parse()
    expectType<typeof a>(
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
    const a = Command.create()
      .parametersExclusive(`method`, ($$) =>
        $$.parameter(`v version`, s).parameter(`b bump`, e).default(`bump`, `patch`),
      )
      .settings(settings)
      .parse()
    expect(a.method).toMatchObject({ _tag: `bump`, value: `patch` })
  })
})
