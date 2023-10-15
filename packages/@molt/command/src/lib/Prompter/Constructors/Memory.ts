import type { KeyPress } from '../../KeyPress/index.js'
import type { Prompter } from '../Prompter.js'
import { create } from './_core.js'
import { Effect, Stream } from 'effect'

export type MemoryPrompter = ReturnType<typeof createMemoryPrompter>

/**
 * A utility for testing prompts. It allows programmatic control of
 * the input and capturing of the output of a prompts session.
 */
export const createMemoryPrompter = () => {
  const state: {
    inputScript: string[]
    script: {
      keyPress: KeyPress.KeyPressEvent<any>[]
    }
    history: {
      output: string[]
      answers: string[]
      all: string[]
    }
  } = {
    inputScript: [],
    script: { keyPress: [] },
    history: {
      answers: [],
      output: [],
      all: [],
    },
  }
  const prompter: Prompter = create({
    output: (value) => {
      state.history.output.push(value)
      state.history.all.push(value)
    },
    readLine: () => {
      const value = state.inputScript.shift()
      if (value === undefined)  throw new Error(`No more values in read script.`) //prettier-ignore
      state.history.answers.push(value)
      state.history.all.push(value)
      return Effect.succeed(value)
    },
    readKeyPresses: (params) =>
      Stream.fromIterable(state.script.keyPress).pipe(
        Stream.filter((event) => {
          return params?.matching?.includes(event.name) ?? true
        }),
      ),
  })
  return {
    history: state.history,
    script: state.script,
    answers: {
      add: (values: string[]) => {
        state.inputScript.push(...values)
      },
      get: () => state.inputScript,
    },
    ...prompter,
  }
}
