import { PromptEngine } from '../../../lib/PromptEngine/PromptEngine.js'
import { Term } from '../../../term.js'
import type { Optionality } from '../../helpers.js'
import { runtimeIgnore, type Type, TypeSymbol } from '../../helpers.js'
import { Effect, Either } from 'effect'

export interface Number extends Type<number> {
  _tag: 'TypeNumber'
  refinements: Refinements
}

type Number_ = Number // eslint-disable-line

interface Refinements {
  int?: boolean
  min?: number
  max?: number
  multipleOf?: number
  finite?: boolean
}

// eslint-disable-next-line
export const number = ({
  refinements,
  description,
  optionality,
}: {
  optionality: Optionality<number>
  refinements?: Refinements
  description?: string
}): Number_ => {
  const type: Number_ = {
    _tag: `TypeNumber`,
    priority: 5,
    refinements: refinements ?? {},
    description: description ?? null,
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    optionality,
    deserialize: (serializedValue) => {
      const result = Number(serializedValue)
      if (isNaN(result)) {
        return Either.left(new Error(`Failed to parse number from ${serializedValue}.`))
      }
      return Either.right(result)
    },
    display: () => Term.colors.positive(`number`),
    displayExpanded: () => {
      return type.display()
    },
    help: () => type.displayExpanded(),
    validate: (value) => {
      if (optionality._tag === `optional` && value === undefined) return Either.right(value)
      const errors: string[] = []

      if (typeof value !== `number`) {
        return Either.left({ value, errors: [`Value is not a number.`] })
      }

      if (!refinements) return Either.right(value)

      if (refinements.int && !Number.isInteger(value)) {
        errors.push(`Value is not an integer.`)
      }
      if (refinements.min) {
        if (value < refinements.min) {
          errors.push(`value must be bigger than ${refinements.min}.`)
        }
      }
      if (refinements.max) {
        if (value > refinements.max) {
          errors.push(`value must be smaller than ${refinements.max}.`)
        }
      }
      if (refinements.multipleOf) {
        if (value % refinements.multipleOf !== 0) {
          errors.push(`Value is not a multiple of ${refinements.multipleOf}.`)
        }
      }

      if (errors.length > 0) {
        return Either.left({ value, errors })
      }

      return Either.right(value)
    },
    prompt: (params) =>
      Effect.gen(function* (_) {
        interface State {
          value: string
        }
        const initialState: State = { value: `` }
        const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
        const prompt = PromptEngine.create({
          channels: params.channels,
          cursor: true,
          skippable: optionality._tag !== `required`,
          initialState,
          on: [
            {
              run: (state, event) => {
                return {
                  value: event.name === `backspace` ? state.value.slice(0, -1) : state.value + event.sequence,
                }
              },
            },
          ],
          draw: (state) => {
            return marginLeftSpace + params.prompt + state.value
          },
        })
        const state = yield* _(prompt)
        if (state === null) return undefined
        if (state.value === ``) return undefined
        const valueParsed = parseFloat(state.value)
        if (isNaN(valueParsed)) return null as any // todo remove cast
        return valueParsed
      }),
  }
  return type
}
