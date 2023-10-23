import { Type } from '../Type/index.js'
import type { Output } from './output.js'
import { Alge } from 'alge'
import { Either } from 'effect'

export const validate = <T>(spec: Output, value: T): Type.ValidationResult<T> => {
  return Alge.match(spec)
    .Basic((spec) => validateBasic(spec, value))
    .Exclusive((spec) => validateExclusive(spec, value))
    .done()
}

const validateBasic = <T>(spec: Output.Basic, value: T): Type.ValidationResult<T> => {
  if (value === undefined) {
    if (spec.optionality._tag === `required`) {
      return Either.left({ value, errors: [`Value is undefined. A value is required.`] })
    }
    return Either.right(value)
  }
  return Type.validate(spec.type, value)
}

const validateExclusive = <T>(_spec: Output.Exclusive, _value: T): Type.ValidationResult<T> => {
  // todo do we need this?
  return null as any
}
