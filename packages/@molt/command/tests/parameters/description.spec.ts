import { Command } from '../../src/index.js'
import { s } from '../_/helpers.js'
import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'
import { mockProcessExit, mockProcessStdout } from 'vitest-mock-process'

const processStdout = mockProcessStdout()
mockProcessExit()

describe(`placement of describe method in zod method chain does not matter`, () => {
  it(`description can trail optional`, () => {
    Command.parameters({ a: s.optional().describe(`Blah blah blah.`) }).parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah./)
  })

  it(`description can lead optional`, () => {
    Command.parameters({ a: s.describe(`Blah blah blah.`).optional() }).parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah./)
  })

  it(`description can trail default`, () => {
    Command.parameters({ a: s.default(`x`).describe(`Blah blah blah.`) }).parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah./)
  })

  it(`description can lead default`, () => {
    Command.parameters({ a: s.describe(`Blah blah blah.`).default(`x`) }).parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah./)
  })
})

describe(`when there are multiple describe methods in the zod method chain only the last (outer most) one is used`, () => {
  it(`last description instance wins`, () => {
    // prettier-ignore
    Command.parameters({ a: s.describe(`Blah blah blah 1.`).describe(`Blah blah blah 2.`) }).parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah 2./)
  })

  it(`last description instance separated by default wins`, () => {
    // prettier-ignore
    Command.parameters({ a: s.describe(`Blah blah blah 1.`).default(`x`).describe(`Blah blah blah 2.`) }).parse( { line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah 2./)
  })

  // prettier-ignore
  it(`last description instance separated by optional wins`, () => {
    Command.parameters({ a: s.describe(`Blah blah blah 1.`).optional().describe(`Blah blah blah 2.`) }).parse({ line: [`-h`], })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatch(/Blah blah blah 2./)
  })
})
