import type { Settings } from '../src/index.js'
import { Command } from '../src/index.js'
import { as, e, s } from './_/helpers.js'
import { expectType } from 'tsd'
import { describe, expect, it } from 'vitest'

let c
const settings: Settings.Input = { onError: `throw`, helpOnError: false }

describe(`optional`, () => {
  it(`leads to optional type`, () => {
    c = Command.parametersExclusive(`method`, ($$) =>
      $$.parameter(`v version`, s).parameter(`b bump`, e).optional()
    ).parse({ line: [`-v`, `1.0.0`] })

    expectType<typeof c>(
      as<{
        method?:
          | {
              _tag: 'version'
              value: string
            }
          | {
              _tag: 'bump'
              value: 'major' | 'minor' | 'patch'
            }
      }>()
    )
  })

  it(`can accept line arg`, () => {
    c = Command.parametersExclusive(`method`, ($$) =>
      $$.parameter(`v version`, s).parameter(`b bump`, e).optional()
    ).parse({ line: [`-v`, `1.0.0`] })
    expect(c).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
  })

  it(`can accept env arg`, () => {
    c = Command.parametersExclusive(`method`, ($$) =>
      $$.parameter(`v version`, s).parameter(`b bump`, e).optional()
    ).parse({ environment: { cli_param_v: `1.0.0` } })
    expect(c).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
  })
  it(`can accept nothing`, () => {
    c = Command.parametersExclusive(`method`, ($$) =>
      $$.parameter(`v version`, s).parameter(`b bump`, e).optional()
    ).parse()
    expect(`method` in c).toBe(false)
  })
  it(`if two args then error`, () => {
    const c = Command.parametersExclusive(`method`, ($$) =>
      $$.parameter(`v version`, s).parameter(`b bump`, e).optional()
    ).settings(settings)
    expect(() => c.parse({ line: [`-v`, `1.0.0`, `-b`, `major`] })).toThrowErrorMatchingSnapshot()
  })
})

describe(`required`, () => {
  it(`if no arg given then error`, () => {
    const c = Command.parametersExclusive(`method`, ($$) =>
      $$.parameter(`v version`, s).parameter(`b bump`, e)
    ).settings(settings)
    expect(c.parse).toThrowErrorMatchingSnapshot()
  })
  it(`if two args then error`, () => {
    const c = Command.parametersExclusive(`method`, ($$) =>
      $$.parameter(`v version`, s).parameter(`b bump`, e)
    ).settings(settings)
    expect(() => c.parse({ line: [`-v`, `1.0.0`, `-b`, `major`] })).toThrowErrorMatchingSnapshot()
  })
})
