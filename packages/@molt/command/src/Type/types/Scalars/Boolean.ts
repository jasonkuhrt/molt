import { Term } from '../../../term.js'
import type { Type } from '../../helpers.js'
import { runtimeIgnore, TypeSymbol } from '../../helpers.js'
import { Either } from 'effect'

export interface Boolean extends Type<boolean> {
  _tag: 'TypeBoolean'
}

// eslint-disable-next-line
export const boolean = (description?: string): Boolean => {
  return {
    _tag: `TypeBoolean`,
    description: description ?? null,
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    // eslint-disable-next-line
    validate: (value: unknown) => {
      return typeof value === `boolean`
        ? Either.right(value)
        : Either.left({ value, errors: [`Value is not a boolean.`] })
    },
    help: () => {
      return Term.colors.positive(`boolean`)
    },
  }
}
