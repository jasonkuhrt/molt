import { Command } from '../../src/index.js'
import { expect, it } from 'vitest'
import { mockProcessExit } from 'vitest-mock-process'
import { z } from 'zod'

const processExit = mockProcessExit()

it(`exits 0`, () => {
  Command.create({ a: z.string().optional() }).parseOrThrow([`-h`])
  expect(processExit.mock.lastCall?.[0]).toBe(0)
})

it(`can be triggered by -h`, () => {
  Command.create({ a: z.string().optional() }).parseOrThrow([`-h`])
  expect(processExit.mock.lastCall?.[0]).toBe(0)
})

it(`can be triggered by --help`, () => {
  Command.create({ a: z.string().optional() }).parseOrThrow([`-h`])
  expect(processExit.mock.lastCall?.[0]).toBe(0)
})
