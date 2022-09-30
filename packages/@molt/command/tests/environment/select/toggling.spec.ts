import { Command } from '../../../src/index.js'
import { environmentManager } from '../__helpers__.js'
import { expect, it } from 'vitest'
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
  expect(args).toEqual({ foo: `env1`, bar: `bar` })
})

it(`can change prefix for one parameter`, () => {
  environmentManager.set(`foo`, `env1`)
  environmentManager.set(`cli_param_bar`, `env2`)
  const args = Command.create({
    '--foo': z.string().default(`foo`),
    '--bar': z.string().default(`bar`),
  })
    .settings({ parameters: { environment: { foo: { prefix: null }, bar: true } } })
    .parseOrThrow([])
  expect(args).toEqual({ foo: `env1`, bar: `env2` })
})

it(`can change default prefix and prfix for one parameter`, () => {
  environmentManager.set(`foo`, `env1`)
  environmentManager.set(`param_bar`, `env2`)
  const args = Command.create({
    '--foo': z.string().default(`foo`),
    '--bar': z.string().default(`bar`),
  })
    .settings({
      parameters: {
        environment: {
          $default: { prefix: `param` },
          foo: { prefix: null },
          bar: true,
        },
      },
    })
    .parseOrThrow([])
  expect(args).toEqual({ foo: `env1`, bar: `env2` })
})

it.only(`when setting params and default the default is disabled`, () => {
  environmentManager.set(`foo`, `env1`)
  environmentManager.set(`param_bar`, `env2`)
  environmentManager.set(`param_qux`, `env3`)
  const args = Command.create({
    '--foo': z.string().default(`foo`),
    '--bar': z.string().default(`bar`),
    '--qux': z.string().default(`qux`),
  })
    .settings({
      parameters: {
        environment: {
          $default: { prefix: `param` },
          foo: { prefix: null },
          bar: true,
        },
      },
    })
    .parseOrThrow([])
  expect(args).toEqual({ foo: `env1`, bar: `env2`, qux: `qux` })
})
