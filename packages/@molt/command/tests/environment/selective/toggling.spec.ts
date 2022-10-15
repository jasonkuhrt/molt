import { Command } from '../../../src/index.js'
import { environmentManager } from '../__helpers__.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

it(`can toggle environment on for one parameter`, () => {
  environmentManager.set(`cli_param_foo`, `env1`)
  environmentManager.set(`cli_param_bar`, `env2`)
  const args = Command.create({
    '--foo': z.string().default(`foo`),
    '--bar': z.string().default(`bar`),
  })
    .settings({ parameters: { environment: { foo: true } } })
    .parseOrThrow([])
  expect(args).toMatchObject({ foo: `env1`, bar: `bar` })
})

it(`can change prefix for one parameter`, () => {
  environmentManager.set(`foo`, `foo_env`)
  environmentManager.set(`cli_param_bar`, `bar_env`)
  const args = Command.create({
    '--foo': z.string().default(`foo_default`),
    '--bar': z.string().default(`bar_default`),
  })
    .settings({ parameters: { environment: { foo: { prefix: false }, bar: true } } })
    .parseOrThrow([])
  expect(args).toMatchObject({ foo: `foo_env`, bar: `bar_env` })
})

it(`can change default prefix and prfix for one parameter`, () => {
  environmentManager.set(`foo`, `foo_env`)
  environmentManager.set(`param_bar`, `bar_env`)
  const args = Command.create({
    '--foo': z.string().default(`default_foo`),
    '--bar': z.string().default(`default_bar`),
  })
    .settings({
      parameters: {
        environment: {
          $default: { prefix: `param` },
          foo: { prefix: false },
          bar: true,
        },
      },
    })
    .parseOrThrow([])
  expect(args).toMatchObject({ foo: `foo_env`, bar: `bar_env` })
})

describe(`when configuring parameters environment becomes opt-in`, () => {
  it(`with default not set`, () => {
    environmentManager.set({ foo: `foo_env`, cli_param_bar: `foo_env`, cli_param_qux: `foo_env` })
    const args = Command.create({
      '--foo': z.string().default(`foo`),
      '--bar': z.string().default(`bar`),
      '--qux': z.string().default(`qux`),
    })
      .settings({
        parameters: {
          environment: {
            foo: { prefix: false },
          },
        },
      })
      .parseOrThrow([])
    expect(args).toMatchObject({ foo: `foo_env`, bar: `bar`, qux: `qux` })
  })
  it(`even with default configured`, () => {
    environmentManager.set({ moo_foo: `foo_env`, moo_bar: `bar_env`, moo_qux: `qux_env` })
    const args = Command.create({
      '--foo': z.string().default(`foo`),
      '--bar': z.string().default(`bar`),
      '--qux': z.string().default(`qux`),
    })
      .settings({
        parameters: {
          environment: {
            $default: { prefix: `moo` },
            foo: true,
          },
        },
      })
      .parseOrThrow([])
    expect(args).toMatchObject({ foo: `foo_env`, bar: `bar`, qux: `qux` })
  })
  describe(` unless...`, () => {
    it(`default is shorthand true`, () => {
      environmentManager.set({ moo_foo: `moo_foo_env`, cli_param_bar: `bar_env`, cli_param_qux: `qux_env` })
      const args = Command.create({
        '--foo': z.string().default(`foo`),
        '--bar': z.string().default(`bar`),
        '--qux': z.string().default(`qux`),
      })
        .settings({ parameters: { environment: { $default: true, foo: { prefix: `MOO` } } } })
        .parseOrThrow([])
      expect(args).toMatchObject({ foo: `moo_foo_env`, bar: `bar_env`, qux: `qux_env` })
    })
    it(`default is longhand true`, () => {
      environmentManager.set({ moo_foo: `moo_foo_env`, cli_param_bar: `bar_env`, cli_param_qux: `qux_env` })
      const args = Command.create({
        '--foo': z.string().default(`foo`),
        '--bar': z.string().default(`bar`),
        '--qux': z.string().default(`qux`),
      })
        .settings({ parameters: { environment: { $default: { enabled: true }, foo: { prefix: `MOO` } } } })
        .parseOrThrow([])
      expect(args).toMatchObject({ foo: `moo_foo_env`, bar: `bar_env`, qux: `qux_env` })
    })
  })
})
