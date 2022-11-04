import { Command } from '../../src/index.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

let c
const as = <T>(): T => undefined as any
const s = z.string()
const e = z.enum([`major`, `minor`, `patch`])
const settings = { onError: 'throw' as const, helpOnNoArguments: false }

it(`works`, () => {
  const args = Command.parametersExclusive(`method`, ($$) =>
    $$.parameter(`v version`, s).parameter(`b bump`, e).optional()
  )
    .settings(settings)
    .parse({ line: [`-v`, `1.0.0`] })

  expectType<typeof args>(
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

  expect(args).toMatchObject({ method: { _tag: `version`, value: `1.0.0` } })
})
