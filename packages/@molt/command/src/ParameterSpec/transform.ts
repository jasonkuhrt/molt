import type { Output } from './output.js'
import { Alge } from 'alge'

export const transform = <T>(spec: Output, value: T): T => {
  return Alge.match(spec)
    .Basic((spec) => transformBasic(spec, value))
    .Union((spec) => transformUnion(spec, value))
    .Exclusive((spec) => transformExclusive(spec, value))
    .done()
}

const transformBasic = (spec: Output.Basic, value: unknown): any => {
  if (spec.type._tag === `TypeString`) {
    if (typeof value === `string`) {
      if (spec.type.transformations?.trim) {
        return value.trim()
      }
    }
  }

  return value
}

const transformUnion = <T>(_spec: Output.Union, value: T): T => {
  // TODO how do we handle this?
  // If one member has trim, how do we know if we should apply the transformation before
  // assigning the value to it via the validation? But we need trim before validation??
  // throw new Error(`todo`)
  return value
}

const transformExclusive = (_spec: Output.Exclusive, _value: unknown): any => {
  // todo do we need this?
  return null as any
}
