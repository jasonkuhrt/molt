import type { MemoryPrompter } from '../../../src/parse/prompt.js'
import { createMemoryPrompter } from '../../../src/parse/prompt.js'
import { afterEach, beforeEach, expect } from 'vitest'

export let memoryPrompter: MemoryPrompter

beforeEach(() => {
  memoryPrompter = createMemoryPrompter()
})

afterEach(() => {
  expect(memoryPrompter.answers.get()).toEqual([])
})
