import { Command } from '../../../src/index.js'
import { environmentManager } from '../__helpers__.js'
import { expect } from 'vitest'
import { it } from 'vitest'
import { z } from 'zod'

it(`is enabled by default`, () => {
  environmentManager.set(`cli_parameter_foo`, `bar`)
  const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
  expect(args).toEqual({ foo: `bar` })
})
it(`can be enabled by settings`, () => {
  environmentManager.set(`cli_param_foo`, `bar`)
  const args1 = Command.create({ '--foo': z.string() })
    .settings({ parameters: { environment: true } })
    .parseOrThrow([])
  expect(args1).toEqual({ foo: `bar` })
  const args2 = Command.create({ '--foo': z.string() })
    .settings({ parameters: { environment: { $default: true } } })
    .parseOrThrow([])
  expect(args2).toEqual({ foo: `bar` })
  const args3 = Command.create({ '--foo': z.string() })
    .settings({ parameters: { environment: { $default: { enabled: true } } } })
    .parseOrThrow([])
  expect(args3).toEqual({ foo: `bar` })
})
it(`can be enabled by environment`, () => {
  environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `true`)
  environmentManager.set(`cli_param_foo`, `bar`)
  const args = Command.create({ '--foo': z.string() }).parseOrThrow([])
  expect(args).toEqual({ foo: `bar` })
})
it.only(`can be disabled by environment`, () => {
  environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `false`)
  environmentManager.set(`cli_param_foo`, `foo_env`)
  const args = Command.create({ '--foo': z.string().default(`foo_default`) }).parseOrThrow([])
  expect(args).toEqual({ foo: `foo_default` })
})
it(`environment supersedes settings`, () => {
  environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `false`)
  environmentManager.set(`cli_foo`, `bar`)
  expect(() =>
    Command.create({ '--foo': z.string() })
      .settings({ parameters: { environment: true } })
      .parseOrThrow([])
  ).toThrow()
})
