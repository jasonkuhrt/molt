import { Command } from '../../src/index.js'
import { expect, it } from 'vitest'
import { mockProcessExit, mockProcessStdout } from 'vitest-mock-process'
import { z } from 'zod'

const processStdout = mockProcessStdout()
mockProcessExit()

it(`if there is optional param it is shown`, () => {
  Command.create({ a: z.string().optional() }).parseOrThrow([`-h`])
  expect(processStdout.mock.lastCall?.[0]).toMatchSnapshot()
})

it(`if parameter has description it is shown`, () => {
  Command.create({ a: z.string().optional().describe(`Blah blah blah.`) }).parseOrThrow([`-h`])
  expect(processStdout.mock.lastCall?.[0]).toMatchSnapshot()
})

it.only(`long description wraps within column`, () => {
  Command.create({
    a: z.string().optional().describe(`Blah blah blah. Blah blah blah. Blah blah blah.`),
  }).parseOrThrow([`-h`])
  expect(processStdout.mock.lastCall?.[0]).toMatchSnapshot()
})

it(`if parameter has default it is shown`, () => {
  Command.create({ a: z.string().default(`foobar`) }).parseOrThrow([`-h`])
  expect(processStdout.mock.lastCall?.[0]).toMatchSnapshot()
})
