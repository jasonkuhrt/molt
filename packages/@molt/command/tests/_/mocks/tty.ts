import { Prompter } from '../../../src/lib/Prompter/index.js'
import { afterEach, beforeEach, expect } from 'vitest'

export let memoryPrompter: Prompter.MemoryPrompter

beforeEach(() => {
  memoryPrompter = Prompter.createMemoryPrompter()
})

afterEach(() => {
  expect(memoryPrompter.answers.get()).toEqual([])
})
