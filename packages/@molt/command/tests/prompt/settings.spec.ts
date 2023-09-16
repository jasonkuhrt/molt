import type { Settings } from '../../src/index.js'
import { Command } from '../../src/index.js'
import type { ParameterSpec } from '../../src/ParameterSpec/index.js'
import { s, tryCatch } from '../_/helpers.js'
import { tty } from '../_/mocks/tty.js'
import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'

const S = <S extends ParameterSpec.Input.Schema>(settings: Settings.InputPrompt<S>) => settings

describe(`parameter level`, () => {
  it(`can be passed object`, () => {
    tty.mock.input.add([`foo`])
    const args = tryCatch(() =>
      Command.create()
        .parameter(`a`, { schema: s, prompt: { enabled: true } })
        .settings({ onError: `throw`, helpOnError: false })
        .parse({ line: [], tty: tty.interface }),
    )
    expect(args).toMatchSnapshot(`args`)
    expect(tty.history.all).toMatchSnapshot(`tty`)
    expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
  })
})

describe(`command level`, () => {
  it(`passing object makes enabled default to true`, () => {
    tty.mock.input.add([`foo`])
    const args = Command.create()
      .parameter(`a`, { schema: s })
      .settings({ onError: `throw`, helpOnError: false, prompt: { when: { result: `rejected` } } })
      .parse({ line: [], tty: tty.interface })
    expect(args).toMatchSnapshot(`args`)
    expect(tty.history.all).toMatchSnapshot(`tty`)
    expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
  })
})

it(`prompt is disabled by default`, () => {
  const args = tryCatch(() =>
    Command.create()
      .parameter(`a`, { schema: s })
      .settings({ onError: `throw`, helpOnError: false })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

it(`prompt can be enabled by default`, () => {
  tty.mock.input.add([`foo`])
  const args = tryCatch(() =>
    Command.create()
      .parameter(`a`, { schema: s })
      .settings({ onError: `throw`, helpOnError: false, prompt: { enabled: true } })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

it(`parameter settings overrides default settings`, () => {
  const args = tryCatch(() =>
    Command.create()
      .parameter(`a`, { schema: s, prompt: false })
      .settings({ onError: `throw`, helpOnError: false, prompt: { enabled: true } })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

describe(`prompt can be toggled by check on error`, () => {
  describe(`toggle to enabled`, () => {
    const settings = S<typeof s>({
      enabled: true,
      when: { result: `rejected`, error: `ErrorMissingArgument`, spec: { name: { canonical: `a` } } },
    })
    it(`check does match`, () => {
      tty.mock.input.add([`foo`])
      const args = tryCatch(() =>
        Command.create()
          .parameter(`a`, { schema: s })
          .settings({ onError: `throw`, helpOnError: false, prompt: settings })
          .parse({ line: [], tty: tty.interface }),
      )
      expect(args).toMatchSnapshot(`args`)
      expect(tty.history.all).toMatchSnapshot(`tty`)
      expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
    it(`check does not match`, () => {
      const args = tryCatch(() =>
        Command.create()
          .parameter(`b`, { schema: s })
          .settings({ onError: `throw`, helpOnError: false, prompt: settings })
          .parse({ line: [], tty: tty.interface }),
      )
      expect(args).toMatchSnapshot(`args`)
      expect(tty.history.all).toMatchSnapshot(`tty`)
      expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
    })
  })
})

it(`parameter defaults to custom settings`, () => {
  tty.mock.input.add([`foo`])
  const args = tryCatch(() =>
    Command.create()
      .parameter(`a`, { schema: s })
      .settings({
        onError: `throw`,
        helpOnError: false,
        prompt: {
          enabled: true,
          when: {
            result: `rejected`,
            spec: { optionality: `required` },
          },
        },
      })
      .parse({ line: [], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})

it(`can be stack of conditional prompts`, () => {
  const settings = S({
    enabled: true,
    when: [
      {
        result: `rejected`,
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
    Command.create()
      .parameter(`a`, { schema: s.optional() })
      .settings({ onError: `throw`, helpOnError: false, prompt: settings })
      .parse({ line: [`-a`, `1`], tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
})
