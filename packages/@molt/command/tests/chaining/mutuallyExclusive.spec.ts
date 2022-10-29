import { Command } from '../../src/index.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

let c
const s = z.string()

it(`works`, () => {
  const args = Command.parametersExclusive(`method`, ($) =>
    $.parameter(`v version`, s)
      .parameter(`b bump`, z.enum([`major`, `minor`, `patch`]))
      .optional()
  ).parse({
    line: [`-v`, `1.0.0`],
  })

  expectType<{
    method:
      | {
          _tag: 'version'
          value: string
        }
      | {
          _tag: 'bump'
          value: 'major' | 'minor' | 'patch'
        }
  }>(args)

  expect(args).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
})
