import { expect } from 'vitest'
import { it } from 'vitest'
import { z } from 'zod'
import { $, s } from '../../_/helpers.js'
import { environmentManager } from '../__helpers__.js'

it(`just one can have prefix disabled`, () => {
  environmentManager.set({
    foo: `foo`,
    cli_param_bar: `bar-prefix`,
  })
  const args = $.parameter(`--foo`, s)
    .parameter(`--bar`, z.string())
    .settings({ parameters: { environment: { $default: true, foo: { prefix: false } } } })
    .parse({ line: [] })
  expect(args).toMatchObject({ foo: `foo`, bar: `bar-prefix` })
})

it(`all but one can have prefix disabled`, () => {
  environmentManager.set({
    bar: `bar`,
    cli_param_foo: `cli_param_foo`,
  })
  const args = $.parameter(`--foo`, s)
    .parameter(`--bar`, s)
    .settings({
      parameters: { environment: { $default: { enabled: true, prefix: false }, foo: { prefix: true } } },
    })
    .parse({ line: [] })
  expect(args).toMatchObject({ foo: `cli_param_foo`, bar: `bar` })
})
