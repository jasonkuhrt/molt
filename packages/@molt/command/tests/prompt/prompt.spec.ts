import type { ParameterConfiguration } from '../../src/Builder/root/types.js'
import type { Settings } from '../../src/entrypoints/types.js'
import { Command } from '../../src/index.js'
import type { KeyPress } from '../../src/lib/KeyPress/index.js'
import { b, l1, s, tryCatch } from '../_/helpers.js'
import { memoryPrompter } from '../_/mocks/tty.js'
import stripAnsi from 'strip-ansi'
import { expectType } from 'tsd'
import { beforeEach, describe, expect, it } from 'vitest'

// TODO test that prompt order is based on order of parameter definition

let parameters: Record<string, ParameterConfiguration>
let answers: string[]
let keyPresses: KeyPress.KeyPressEvent[]
let line: string[]
const settings: Settings.Input = {}

beforeEach(() => {
  parameters = {}
  answers = []
  keyPresses = []
  line = []
})

describe(`boolean`, () => {
  it(`defaults to "no"`, async () => {
    parameters = { a: { schema: b, prompt: true } }
    keyPresses.push({ ctrl: false, meta: false, sequence: ``, shift: false, name: `return` })
    await run()
  })
  it(`can be toggled to "yes"`, async () => {
    parameters = { a: { schema: b, prompt: true } }
    keyPresses.push(
      { ctrl: false, meta: false, sequence: ``, shift: false, name: `right` },
      { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
    )
    await run()
  })
  it(`can be toggled to "yes" and then back to "no"`, async () => {
    parameters = { a: { schema: b, prompt: true } }
    keyPresses.push(
      { ctrl: false, meta: false, sequence: ``, shift: false, name: `right` },
      { ctrl: false, meta: false, sequence: ``, shift: false, name: `left` },
      { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
    )
    await run()
  })
  it(`can use tab to toggle between "yes" and "no"`, async () => {
    parameters = { a: { schema: b, prompt: true } }
    keyPresses.push(
      { ctrl: false, meta: false, sequence: ``, shift: false, name: `tab` },
      { ctrl: false, meta: false, sequence: ``, shift: false, name: `tab` },
      { ctrl: false, meta: false, sequence: ``, shift: false, name: `return` },
    )
    await run()
  })
})

it(`can be explicitly disabled`, async () => {
  parameters = {
    a: {
      schema: s,
      prompt: { enabled: false },
    },
  }
  answers = []
  line = []
  await run()
})

it(`can be explicitly disabled with a "when" condition present`, async () => {
  parameters = {
    a: {
      schema: s.min(2),
      prompt: { enabled: false, when: { result: `rejected`, error: `ErrorMissingArgument` } },
    },
  }
  answers = []
  line = []
  await run()
})

it(`prompt when missing input`, async () => {
  parameters = {
    a: { schema: s.min(2), prompt: { when: { result: `rejected`, error: `ErrorMissingArgument` } } },
  }
  answers = [`foo`]
  line = []
  await run()
})

it(`prompt when invalid input`, async () => {
  parameters = {
    a: { schema: s.min(2), prompt: { when: { result: `rejected`, error: `ErrorInvalidArgument` } } },
  }
  answers = [`foo`]
  line = [`-a`, `1`]
  await run()
})

it(`prompt when invalid input OR missing input`, async () => {
  parameters = {
    a: {
      schema: s.min(2),
      prompt: { when: { result: `rejected`, error: [`ErrorInvalidArgument`, `ErrorMissingArgument`] } },
    },
  }
  answers = [`foo`]
  line = [`-a`, `1`]
  await run()
})

it(`prompt when omitted`, async () => {
  parameters = {
    a: {
      schema: s.min(2).optional(),
      // @ts-expect-error todo
      prompt: { when: { result: `omitted`, spec: { optionality: [`default`, `optional`] } } },
    },
  }
  answers = [`foo`]
  line = []
  await run()
})

it(`static error to match on omitted event on required parameter by .parameter(...)`, () => {
  // @ts-expect-error not available
  Command.create().parameter(`a`, { schema: s, prompt: { when: { result: `omitted` } } })
  // Is fine, because parameter is optional.
  Command.create().parameter(`a`, {
    schema: s.optional(),
    prompt: { when: { result: `omitted` } },
  })
})

it(`can pass just one pattern in multiple pattern syntax`, () => {
  Command.create()
    .parameter(`a`, s)
    .settings({ prompt: { when: [{ result: `accepted` }] } })
})

it(`static error to match on omitted event on command level when no parameters have optional`, () => {
  Command.create()
    .parameter(`a`, s)
    // @ts-expect-error not available
    .settings({ prompt: { when: { result: `omitted` } } })
  // Is fine, because parameter is optional.
  Command.create()
    .parameter(`a`, s.optional())
    .settings({ prompt: { when: { result: `omitted` } } })
  // Is fine, because at least one parameter is optional.
  Command.create()
    .parameter(`a`, s.optional())
    .parameter(`b`, s)
    .settings({ prompt: { when: { result: `omitted` } } })
})

// TODO should be able match on common event properties _without_ specifying the event type...
// Command.create().parameter(`a`, s).settings({
//   prompt: { when: { spec: { name: { aliases: { long: [`a`, `b`] } } } } },
// })

// TODO already taken care of by match test suite?
it(`array value`, () => {
  // Can pass ONE literal match
  Command.create()
    .parameter(`a`, s)
    .settings({
      prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: [`a`, `b`] } } } } },
    })
  // can pass an OR literal match
  Command.create()
    .parameter(`a`, s)
    .settings({
      prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: [[`a`, `b`], [`c`]] } } } } },
    })
  Command.create()
    .parameter(`a`, s)
    .settings({
      // @ts-expect-error Cannot pass the array member literal
      prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: `a` } } } } },
    })
  Command.create()
    .parameter(`a`, s)
    .settings({
      // @ts-expect-error Cannot mix OR and ONE matches
      prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: [`a`, [`b`]] } } } } },
    })
})

// TODO
// it(`static error when fields from different event types matched in single pattern`, () => {
//   Command.create()
//     .parameter(`a`, s)
//     // @ts-expect-error "value" is not available on "rejected" event
//     .settings({ prompt: { when: { result: `rejected`, value: 1 } } })
//   // TODO excess properties should be an error in the pattern match but for some reason are not being here.
//   Command.create().parameter(`a`, {
//     schema: s,
//     prompt: {
//       when: {
//         result: `rejected`,
//         error: `ErrorInvalidArgument`,
//         value: 1,
//         foo: 2,
//         blah: 3,
//         '........ :(': 1,
//       },
//     },
//   })
// })

// prettier-ignore
it(`Static type tests`, () => {
  expectType<() => { a: 1 }>(Command.create().parameter(`a`, { schema: l1, prompt: null }).parse)
  expectType<() => { a: 1 }>(Command.create().parameter(`a`, { schema: l1, prompt: undefined }).parse)
  expectType<() => { a: 1 }>(Command.create().parameter(`a`, { schema: l1, prompt: {enabled:false} }).parse)
  expectType<() => { a: 1 }>(Command.create().parameter(`a`, { schema: l1, prompt: {enabled:false,when:{result:`accepted`}} }).parse)
  expectType<() => { a: 1 }>(Command.create().parameter(`a`, { schema: l1 }).parse)
  expectType<() => { a: 1 }>(Command.create().parameter(`a`, { schema: l1 }).settings({}).parse)
  expectType<() => { a: 1 }>(Command.create().parameter(`a`, { schema: l1 }).settings({prompt:false}).parse)
  expectType<() => { a: 1 }>(Command.create().parameter(`a`, { schema: l1 }).settings({prompt:{enabled:false}}).parse)
  expectType<() => { a: 1 }>(Command.create().parameter(`a`, { schema: l1 }).settings({prompt:{enabled:false,when:{result:`accepted`}}}).parse)
  expectType<() => Promise<{ a: 1 }>>(Command.create().parameter(`a`, { schema: l1, prompt: true }).parameter(`b`, {schema:l1,prompt:false}).parse)
  expectType<() => Promise<{ a: 1 }>>(Command.create().parameter(`a`, { schema: l1, prompt: true }).parse)
  expectType<() => Promise<{ a: 1 }>>(Command.create().parameter(`a`, { schema: l1, prompt: {enabled:true} }).parse)
  expectType<() => Promise<{ a: 1 }>>(Command.create().parameter(`a`, { schema: l1, prompt: {when:{result:`accepted`}} }).parse)
  expectType<() => Promise<{ a: 1 }>>(Command.create().parameter(`a`, { schema: l1, prompt: true }).settings({prompt:false}).parse)
  expectType<() => Promise<{ a: 1 }>>(Command.create().parameter(`a`, { schema: l1 }).settings({prompt:true}).parse)
  expectType<() => Promise<{ a: 1 }>>(Command.create().parameter(`a`, { schema: l1 }).settings({prompt:{enabled:true}}).parse)
  expectType<() => Promise<{ a: 1 }>>(Command.create().parameter(`a`, { schema: l1 }).settings({prompt:{when:{result:`accepted`}}}).parse)
})

/**
 *
 * Helpers
 *
 */

const run = async () => {
  memoryPrompter.answers.add(answers)
  memoryPrompter.script.keyPress.push(...keyPresses)
  // eslint-disable-next-line
  const args = await tryCatch(async () => {
    // eslint-disable-next-line
    return await Object.entries(parameters)
      // @ts-expect-error todo
      .reduce((chain, data) => chain.parameter(data[0] as any, data[1]), Command.create())
      // @ts-expect-error todo
      .settings({ onError: `throw`, helpOnError: false, ...settings })
      .parse({ line, tty: memoryPrompter })
  })
  expect(args).toMatchSnapshot(`args`)
  expect(memoryPrompter.history.all).toMatchSnapshot(`tty`)
  expect(memoryPrompter.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
}
