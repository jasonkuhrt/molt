import { createMemoryPrompter } from '../../../src/lib/Prompter/Prompter.js'
import type { Prompter } from 'packages/@molt/command/src/lib/Prompter/index.js'
import { afterEach, beforeEach, expect } from 'vitest'

export let memoryPrompter: Prompter.MemoryPrompter

beforeEach(() => {
  memoryPrompter = createMemoryPrompter()
})

afterEach(() => {
  expect(memoryPrompter.answers.get()).toEqual([])
})
