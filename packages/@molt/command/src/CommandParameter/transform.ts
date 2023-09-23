import { casesExhausted, entries } from '../helpers.js'
import type { Output } from './output.js'
import { Alge } from 'alge'

/**
 * Apply transformations specific in the parameter. For example strings can be trimmed.
 */
export const transform = <T>(spec: Output, value: T): T => {
  return Alge.match(spec)
    .Basic((spec) => transformBasic(spec, value))
    .Exclusive((spec) => transformExclusive(spec, value))
    .done()
}

const transformBasic = (spec: Output.Basic, value: unknown): any => {
  if (spec.type._tag === `TypeString`) {
    if (typeof value === `string`) {
      if (spec.type.transformations) {
        entries(spec.type.transformations ?? {}).reduce((v, t) => {
          return t[0] === `trim`
            ? v.trim()
            : t[0] === `toCase`
            ? t[1] === `upper`
              ? v.toUpperCase()
              : v.toLowerCase()
            : casesExhausted(t[0])
        }, value)
        let value_ = value
        if (spec.type.transformations?.trim) {
          value_ = value_.trim()
        }
        if (spec.type.transformations?.toCase) {
          if (spec.type.transformations.toCase === `upper`) {
            value_ = value_.toUpperCase()
          } else if (spec.type.transformations.toCase === `lower`) {
            value_ = value_.toLowerCase()
          }
        }
        return value_
      }
    }
  }

  return value
}

const transformExclusive = (_spec: Output.Exclusive, _value: unknown): any => {
  // todo do we need this?
  return null as any
}
