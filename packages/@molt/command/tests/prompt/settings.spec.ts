import type { Settings } from '../../src/index.js'
import { Command } from '../../src/index.js'
import { s, tryCatch } from '../_/helpers.js'
import { tty } from '../_/mocks/tty.js'
import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'

// TODO check the snapshots for this test suite. Validate every test case.

const S = (settings: Settings.InputPrompt) => settings

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

it(`prompt can be enabled by default`, () => {
  tty.mock.input.add([`foo`])
  const settings = S({ enabled: true })
  const args = tryCatch(() =>
    Command.parameters({ a: { schema: s } })
      .settings({ onError: `throw`, helpOnError: false, prompt: settings })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

it(`parameter settings overrides default settings`, () => {
  const settings = S({ enabled: true })
  const args = tryCatch(() =>
    Command.parameters({ a: { schema: s, prompt: false } })
      .settings({ onError: `throw`, helpOnError: false, prompt: settings })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

describe(`prompt can be toggled by check on error`, () => {
  describe(`toggle to disabled`, () => {
    const settings = S({
      enabled: false,
      when: {
        result: `rejected`,
        error: `ErrorMissingArgument`,
      },
    })

    it(`check does match`, () => {
      const args = tryCatch(() =>
        Command.parameters({ a: { schema: s } })
          .settings({ onError: `throw`, helpOnError: false, prompt: settings })
          .parse({ line: [], tty: tty.interface }),
      )
      expect(args).toMatchSnapshot(`args`)
      expect(tty.history.all).toMatchSnapshot(`tty`)
      expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
    it(`check does not match`, () => {
      const args = tryCatch(() =>
        Command.parameters({ a: { schema: s } })
          .settings({ onError: `throw`, helpOnError: false, prompt: settings })
          .parse({ line: [], tty: tty.interface }),
      )
      expect(args).toMatchSnapshot(`args`)
      expect(tty.history.all).toMatchSnapshot(`tty`)
      expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
  })
  describe(`toggle to enabled`, () => {
    const settings = S({
      enabled: true,
      when: { result: `rejected`, error: `ErrorMissingArgument` },
    })
    it(`check does match`, () => {
      tty.mock.input.add([`foo`])
      const args = tryCatch(() =>
        Command.parameters({ a: { schema: s } })
          .settings({ onError: `throw`, helpOnError: false, prompt: settings })
          .parse({ line: [], tty: tty.interface }),
      )
      expect(args).toMatchSnapshot(`args`)
      expect(tty.history.all).toMatchSnapshot(`tty`)
      expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
    it(`check does not match`, () => {
      const args = tryCatch(() =>
        Command.parameters({ a: { schema: s } })
          .settings({ onError: `throw`, helpOnError: false, prompt: settings })
          .parse({ line: [], tty: tty.interface }),
      )
      expect(args).toMatchSnapshot(`args`)
      expect(tty.history.all).toMatchSnapshot(`tty`)
      expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
  })
})

it(`can default to prompt on parameter spec condition`, () => {
  const settings = S({
    enabled: true,
    when: {
      result: `rejected`,
      spec: { optionality: `required` },
    },
  })
  tty.mock.input.add([`foo`])
  const args = tryCatch(() =>
    Command.parameters({ a: { schema: s } })
      .settings({ onError: `throw`, helpOnError: false, prompt: settings })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

it(`default can be stack of conditional prompts`, () => {
  const settings = S({
    enabled: true,
    when: [
      {
        error: `ErrorInvalidArgument`,
      },
      {
        result: `accepted`,
        spec: { optionality: `optional` },
        value: `1`,
      },
    ],
  })
  tty.mock.input.add([`foo`])
  const args = tryCatch(() =>
    Command.parameters({ a: { schema: s.optional() } })
      .settings({ onError: `throw`, helpOnError: false, prompt: settings })
      .parse({ line: [`-a`, `1`], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})
