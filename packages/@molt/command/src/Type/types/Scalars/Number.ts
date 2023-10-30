import { Term } from '../../../term.js'
import { runtimeIgnore, type Type, TypeSymbol } from '../../helpers.js'
import { Either } from 'effect'

export interface Number extends Type<number>, Refinements {
  _tag: 'TypeNumber'
}

interface Refinements {
  int?: boolean
  min?: number
  max?: number
  multipleOf?: number
  finite?: boolean
}

// eslint-disable-next-line
export const number = (refinements?: Refinements, description?: string): Number => {
  return {
    _tag: `TypeNumber`,
    ...refinements,
    description: description ?? null,
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    help: () => {
      return Term.colors.positive(`number`)
    },
    validate: (value) => {
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
  }
}
