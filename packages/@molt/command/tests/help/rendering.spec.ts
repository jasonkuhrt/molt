import { Command } from '../../src/index.js'
import stripAnsi from 'strip-ansi'
import { expect, it } from 'vitest'
import { mockProcessExit, mockProcessStdout } from 'vitest-mock-process'
import { z } from 'zod'

const processStdout = mockProcessStdout()
mockProcessExit()

it(`if there is optional param it is shown`, () => {
  Command.create({ a: z.string().optional() }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if parameter has description it is shown`, () => {
  Command.create({ a: z.string().optional().describe(`Blah blah blah.`) }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`long description wraps within column`, () => {
  Command.create({
    a: z.string().optional().describe(`Blah blah blah. Blah blah blah. Blah blah blah.`),
  }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if parameter has default it is shown`, () => {
  Command.create({ a: z.string().default(`foobar`) }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})
