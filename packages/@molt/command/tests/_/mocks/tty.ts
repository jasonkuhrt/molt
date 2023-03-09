import type { MockTTY } from '../../../src/prompt.js'
import { createMockTTY } from '../../../src/prompt.js'
import { afterEach, beforeEach, expect } from 'vitest'

export let tty: MockTTY

beforeEach(() => {
  tty = createMockTTY()
})

afterEach(() => {
  expect(tty.state.readScript).toEqual([])
})
