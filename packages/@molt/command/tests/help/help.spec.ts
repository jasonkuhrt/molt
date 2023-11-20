import { expect, test } from 'vitest'
import { mockProcessExit, mockProcessStdout } from 'vitest-mock-process'
import { $, s } from '../_/helpers.js'

const processExit = mockProcessExit()
const processStdout = mockProcessStdout()

test(`exits 0`, () => {
  $.parameter(`a`, s.optional()).parse({ line: [`-h`] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
})

test(`can be triggered by -h`, () => {
  $.parameter(`a`, s.optional()).parse({ line: [`-h`] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
  expect(processStdout.mock.calls[0]).toMatch(/parameters/i)
})

test(`can be triggered by --help`, () => {
  $.parameter(`a`, s.optional()).parse({ line: [`-h`] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
  expect(processStdout.mock.calls[0]).toMatch(/parameters/i)
})

test(`can be triggered by passing no arguments`, () => {
  $.parameter(`a`, s.optional()).parse({ line: [] })
  expect(processExit.mock.lastCall?.[0]).toBe(0)
  expect(processStdout.mock.calls[0]).toMatch(/parameters/i)
})
