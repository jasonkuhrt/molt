import { Command } from '../../../src/index.js'
import { environmentManager } from '../__helpers__.js'
import { expect } from 'vitest'
import { it } from 'vitest'
import { z } from 'zod'

it(`just one can have prefix disabled`, () => {
  environmentManager.set({
    foo: `foo1`,
    cli_param_foo: `foo-prefix`,
    bar: `bar`,
    cli_param_bar: `bar-prefix`,
  })
  const args = Command.create({ '--foo': z.string(), '--bar': z.string() })
    .settings({ parameters: { environment: { $default: true, foo: { prefix: false } } } })
    .parseOrThrow([])
  expect(args).toEqual({ foo: `foo1`, bar: `bar-prefix` })
})

it(`all but one can have prefix disabled`, () => {
  environmentManager.set({
    foo: `foo1`,
    cli_param_foo: `foo-prefix`,
    bar: `bar`,
    cli_param_bar: `bar-prefix`,
  })
  const args = Command.create({ '--foo': z.string(), '--bar': z.string() })
    .settings({
      parameters: { environment: { $default: { enabled: true, prefix: false }, foo: { prefix: true } } },
    })
    .parseOrThrow([])
  expect(args).toEqual({ foo: `foo-prefix`, bar: `bar` })
})
