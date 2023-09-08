import type { MockTTY } from '../../../src/parse/prompt.js'
import { createMockTTY } from '../../../src/parse/prompt.js'
import { afterEach, beforeEach, expect } from 'vitest'

export let tty: MockTTY

beforeEach(() => {
  tty = createMockTTY()
})

afterEach(() => {
  expect(tty.mock.input.get()).toEqual([])
})
