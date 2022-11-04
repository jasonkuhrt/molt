import { Command } from '../../src/index.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { s, e, as } from '../__helpers__.js'

let c

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
