import { expect } from 'vitest'
import { it } from 'vitest'
import { $, s } from '../../_/helpers.js'
import { createState, environmentManager } from '../__helpers__.js'

const output = createState<string>({
  value: (values) => values.join(``),
})

it(`is enabled by default`, () => {
  environmentManager.set(`cli_parameter_foo`, `bar`)
  const args = $.parameter(`--foo`, s).parse({ line: [] })
  expect(args).toMatchObject({ foo: `bar` })
})
it(`can be enabled by settings`, () => {
  environmentManager.set(`cli_param_foo`, `bar`)
  const args1 = $.parameter(`--foo`, s)
    .settings({ parameters: { environment: true } })
    .parse({ line: [] })
  expect(args1).toMatchObject({ foo: `bar` })
  const args2 = $.parameter(`--foo`, s)
    .settings({ parameters: { environment: { $default: true } } })
    .parse({ line: [] })
  expect(args2).toMatchObject({ foo: `bar` })
  const args3 = $.parameter(`--foo`, s)
    .settings({ parameters: { environment: { $default: { enabled: true } } } })
    .parse({ line: [] })
  expect(args3).toMatchObject({ foo: `bar` })
})
it(`can be enabled by environment`, () => {
  environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `true`)
  environmentManager.set(`cli_param_foo`, `bar`)
  const args = $.parameter(`--foo`, s).parse({ line: [] })
  expect(args).toMatchObject({ foo: `bar` })
})
it(`can be disabled by environment`, () => {
  environmentManager.set(`ClI_settings_READ_arguments_FROM_ENVIRONMENT`, `false`)
  environmentManager.set(`cli_param_foo`, `foo_env`)
  const args = $.parameter(`--foo`, s.default(`foo_default`)).parse({ line: [] })
  expect(args).toMatchObject({ foo: `foo_default` })
})
it(`environment supersedes settings`, () => {
  expect(() =>
    $.parameter(`--foo`, s)
      .settings({
        onOutput: output.set,
        parameters: { environment: true },
        helpOnNoArguments: false,
        onError: `throw`,
      })
      .parse({
        line: [],
        environment: { ClI_settings_READ_arguments_FROM_ENVIRONMENT: `false`, cli_param_foo: `bar` },
      })
  ).toThrowErrorMatchingSnapshot()
  expect(output.value).toMatchSnapshot()
})
