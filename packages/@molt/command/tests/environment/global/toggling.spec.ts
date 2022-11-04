import { Command } from '../../../src/index.js'
import { environmentManager } from '../__helpers__.js'
import { expect } from 'vitest'
import { it } from 'vitest'
import { z } from 'zod'
import { stdout } from '../../__mock__.js'

it(`is enabled by default`, () => {
  environmentManager.set(`cli_parameter_foo`, `bar`)
  const args = Command.parameters({ '--foo': z.string() }).parse({ line: [] })
  expect(args).toMatchObject({ foo: `bar` })
})
it(`can be enabled by settings`, () => {
  environmentManager.set(`cli_param_foo`, `bar`)
  const args1 = Command.parameters({ '--foo': z.string() })
    .settings({ parameters: { environment: true } })
    .parse({ line: [] })
  expect(args1).toMatchObject({ foo: `bar` })
  const args2 = Command.parameters({ '--foo': z.string() })
    .settings({ parameters: { environment: { $default: true } } })
    .parse({ line: [] })
  expect(args2).toMatchObject({ foo: `bar` })
  const args3 = Command.parameters({ '--foo': z.string() })
    .settings({ parameters: { environment: { $default: { enabled: true } } } })
    .parse({ line: [] })
  expect(args3).toMatchObject({ foo: `bar` })
})
it(`can be enabled by environment`, () => {
  environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `true`)
  environmentManager.set(`cli_param_foo`, `bar`)
  const args = Command.parameters({ '--foo': z.string() }).parse({ line: [] })
  expect(args).toMatchObject({ foo: `bar` })
})
it(`can be disabled by environment`, () => {
  environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `false`)
  environmentManager.set(`cli_param_foo`, `foo_env`)
  const args = Command.parameters({ '--foo': z.string().default(`foo_default`) }).parse({ line: [] })
  expect(args).toMatchObject({ foo: `foo_default` })
})
it(`environment supersedes settings`, () => {
  environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `false`)
  environmentManager.set(`cli_foo`, `bar`)
  Command.parameters({ '--foo': z.string() })
    .settings({ parameters: { environment: true }, helpOnNoArguments: false })
    .parse({ line: [] })
  expect(stdout.mock.calls).toMatchSnapshot()
})
