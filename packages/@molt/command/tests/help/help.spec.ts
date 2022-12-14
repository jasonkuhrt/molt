import { Command } from '../../src/index.js'
import { expect, test } from 'vitest'
import { mockProcessExit, mockProcessStdout } from 'vitest-mock-process'
import { z } from 'zod'

const processExit = mockProcessExit()
const processStdout = mockProcessStdout()

test(`exits 0`, () => {
  Command.parameters({ a: z.string().optional() }).parse({ line: [`-h`] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
})

test(`can be triggered by -h`, () => {
  Command.parameters({ a: z.string().optional() }).parse({ line: [`-h`] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
  expect(processStdout.mock.calls[0]).toMatch(/parameters/i)
})

test(`can be triggered by --help`, () => {
  Command.parameters({ a: z.string().optional() }).parse({ line: [`-h`] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
  expect(processStdout.mock.calls[0]).toMatch(/parameters/i)
})

test(`can be triggered by passing no arguments`, () => {
  Command.parameters({ a: z.string().optional() }).parse({ line: [] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
  expect(processStdout.mock.calls[0]).toMatch(/parameters/i)
})
