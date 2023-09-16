import { Command } from '../../../src/index.js'
import { s } from '../../_/helpers.js'
import { environmentManager } from '../__helpers__.js'
import { describe, expect, it } from 'vitest'

it(`can toggle environment on for one parameter`, () => {
  environmentManager.set(`cli_param_foo`, `env1`)
  environmentManager.set(`cli_param_bar`, `env2`)
  const args = Command.create()
    .parameter(`--foo`, s.default(`foo`))
    .parameter(`--bar`, s.default(`bar`))
    .settings({ parameters: { environment: { foo: true } } })
    .parse({ line: [] })
  expect(args).toMatchObject({ foo: `env1`, bar: `bar` })
})

it(`can change prefix for one parameter`, () => {
  environmentManager.set(`foo`, `foo_env`)
  environmentManager.set(`cli_param_bar`, `bar_env`)
  const args = Command.create()
    .parameter(`--foo`, s.default(`foo_default`))
    .parameter(`--bar`, s.default(`bar_default`))
    .settings({ parameters: { environment: { foo: { prefix: false }, bar: true } } })
    .parse({ line: [] })
  expect(args).toMatchObject({ foo: `foo_env`, bar: `bar_env` })
})

it(`can change default prefix and prefix for one parameter`, () => {
  environmentManager.set(`foo`, `foo_env`)
  environmentManager.set(`param_bar`, `bar_env`)
  const args = Command.create()
    .parameter(`--foo`, s.default(`default_foo`))
    .parameter(`--bar`, s.default(`default_bar`))
    .settings({
      parameters: {
        environment: {
          $default: { prefix: `param` },
          foo: { prefix: false },
          bar: true,
        },
      },
    })
    .parse({ line: [] })
  expect(args).toMatchObject({ foo: `foo_env`, bar: `bar_env` })
})

describe(`when configuring parameters, environment becomes opt-in`, () => {
  it(`with default not set`, () => {
    const args = Command.create()
      .parameter(`--foo`, s.default(`foo`))
      .parameter(`--bar`, s.default(`bar`))
      .parameter(`--qux`, s.default(`qux`))
      .settings({
        parameters: {
          environment: {
            foo: { prefix: false },
          },
        },
      })
      .parse({
        line: [],
        environment: { foo: `foo_env`, cli_param_bar: `foo_env`, cli_param_qux: `foo_env` },
      })
    expect(args).toMatchObject({ foo: `foo_env`, bar: `bar`, qux: `qux` })
  })
  it(`even with default configured`, () => {
    const args = Command.create()
      .parameter(`--foo`, s.default(`foo`))
      .parameter(`--bar`, s.default(`bar`))
      .parameter(`--qux`, s.default(`qux`))
      .settings({
        parameters: {
          environment: {
            $default: { prefix: `moo` },
            foo: true,
          },
        },
      })
      .parse({ line: [], environment: { moo_foo: `foo_env`, moo_bar: `bar_env`, moo_qux: `qux_env` } })
    expect(args).toMatchObject({ foo: `foo_env`, bar: `bar`, qux: `qux` })
  })
  describe(` unless...`, () => {
    it(`default is shorthand true`, () => {
      environmentManager.set({ moo_foo: `moo_foo_env`, cli_param_bar: `bar_env`, cli_param_qux: `qux_env` })
      const args = Command.create()
        .parameter(`--foo`, s.default(`foo`))
        .parameter(`--bar`, s.default(`bar`))
        .parameter(`--qux`, s.default(`qux`))
        .settings({ parameters: { environment: { $default: true, foo: { prefix: `MOO` } } } })
        .parse({ line: [] })
      expect(args).toMatchObject({ foo: `moo_foo_env`, bar: `bar_env`, qux: `qux_env` })
    })
    it(`default is longhand true`, () => {
      environmentManager.set({ moo_foo: `moo_foo_env`, cli_param_bar: `bar_env`, cli_param_qux: `qux_env` })
      const args = Command.create()
        .parameter(`--foo`, s.default(`foo`))
        .parameter(`--bar`, s.default(`bar`))
        .parameter(`--qux`, s.default(`qux`))
        .settings({ parameters: { environment: { $default: { enabled: true }, foo: { prefix: `MOO` } } } })
        .parse({ line: [] })
      expect(args).toMatchObject({ foo: `moo_foo_env`, bar: `bar_env`, qux: `qux_env` })
    })
  })
})
