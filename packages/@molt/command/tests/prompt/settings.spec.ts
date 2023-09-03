import type { Settings } from '../../src/index.js'
import { Command } from '../../src/index.js'
import { s, tryCatch } from '../_/helpers.js'
import { tty } from '../_/mocks/tty.js'
import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'

it(`prompt is disabled by default`, () => {
  const args = tryCatch(() =>
    Command.parameters({ a: { schema: s } })
      .settings({ onError: `throw`, helpOnError: false })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

it.only(`prompt can be enabled by default`, () => {
  tty.mock.input.add([`foo`])
  const settings: Settings.InputDefaultsPrompt = { enabled: true }
  const args = tryCatch(() =>
    Command.parameters({ a: { schema: s } })
      .settings({ onError: `throw`, helpOnError: false, defaults: { prompt: settings } })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

it(`parameter settings overrides default settings`, () => {
  const settings: Settings.InputDefaultsPrompt = { enabled: true }
  const args = tryCatch(() =>
    Command.parameters({ a: { schema: s, prompt: false } })
      .settings({ onError: `throw`, helpOnError: false, defaults: { prompt: settings } })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

describe(`prompt can be toggled by check on error`, () => {
  describe(`toggle to disabled`, () => {
    const settings: Settings.InputDefaultsPrompt = {
      enabled: false,
      when: (ctx) => ctx.error?.name === `ErrorMissingArgument`,
    }

    it(`check does match`, () => {
      const args = tryCatch(() =>
        Command.parameters({ a: { schema: s } })
          .settings({ onError: `throw`, helpOnError: false, defaults: { prompt: settings } })
          .parse({ line: [], tty: tty.interface }),
      )
      expect(args).toMatchSnapshot(`args`)
      expect(tty.history.all).toMatchSnapshot(`tty`)
      expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
    it(`check does not match`, () => {
      const args = tryCatch(() =>
        Command.parameters({ a: { schema: s } })
          .settings({ onError: `throw`, helpOnError: false, defaults: { prompt: settings } })
          .parse({ line: [], tty: tty.interface }),
      )
      expect(args).toMatchSnapshot(`args`)
      expect(tty.history.all).toMatchSnapshot(`tty`)
      expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
  })
  describe(`toggle to enabled`, () => {
    const settings: Settings.InputDefaultsPrompt = {
      enabled: true,
      when: (ctx) => ctx.error?.name === `ErrorMissingArgument`,
    }
    it(`check does match`, () => {
      tty.mock.input.add([`foo`])
      const args = tryCatch(() =>
        Command.parameters({ a: { schema: s } })
          .settings({ onError: `throw`, helpOnError: false, defaults: { prompt: settings } })
          .parse({ line: [], tty: tty.interface }),
      )
      expect(args).toMatchSnapshot(`args`)
      expect(tty.history.all).toMatchSnapshot(`tty`)
      expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
    it(`check does not match`, () => {
      const args = tryCatch(() =>
        Command.parameters({ a: { schema: s } })
          .settings({ onError: `throw`, helpOnError: false, defaults: { prompt: settings } })
          .parse({ line: [], tty: tty.interface }),
      )
      expect(args).toMatchSnapshot(`args`)
      expect(tty.history.all).toMatchSnapshot(`tty`)
      expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
  })
})

it(`can default to prompt on parameter spec condition`, () => {
  const settings: Settings.InputDefaultsPrompt = {
    enabled: true,
    when: (ctx) => ctx.parameter.optionality._tag === `required`,
  }
  tty.mock.input.add([`foo`])
  const args = tryCatch(() =>
    Command.parameters({ a: { schema: s } })
      .settings({ onError: `throw`, helpOnError: false, defaults: { prompt: settings } })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

it(`default can be stack of conditional prompts`, () => {
  const settings: Settings.InputDefaultsPrompt = [
    {
      enabled: true,
      when: (ctx) => ctx.error?.name === `ErrorInvalidArgument`,
    },
    {
      enabled: true,
      when: (ctx) => {
        console.log(ctx)
        return ctx.parameter.optionality._tag === `optional` && ctx.argument === `1`
      },
    },
  ]
  tty.mock.input.add([`foo`])
  const args = tryCatch(() =>
    Command.parameters({ a: { schema: s.optional() } })
      .settings({ onError: `throw`, helpOnError: false, defaults: { prompt: settings } })
      .parse({ line: [`-a`, `1`], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})
