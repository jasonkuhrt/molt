import { Command } from '../../src/index.js'
import { s } from '../_/helpers.js'
import { expect, test } from 'vitest'
import { mockProcessExit, mockProcessStdout } from 'vitest-mock-process'

const processExit = mockProcessExit()
const processStdout = mockProcessStdout()

test(`exits 0`, () => {
  Command.parameter(`a`, s.optional()).parse({ line: [`-h`] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
})

test(`can be triggered by -h`, () => {
  Command.parameter(`a`, s.optional()).parse({ line: [`-h`] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
  expect(processStdout.mock.calls[0]).toMatch(/parameters/i)
})

test(`can be triggered by --help`, () => {
  Command.parameter(`a`, s.optional()).parse({ line: [`-h`] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
  expect(processStdout.mock.calls[0]).toMatch(/parameters/i)
})

test(`can be triggered by passing no arguments`, () => {
  Command.parameter(`a`, s.optional()).parse({ line: [] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
  expect(processStdout.mock.calls[0]).toMatch(/parameters/i)
})
