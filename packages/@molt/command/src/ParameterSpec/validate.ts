import { Patterns } from '../lib/Patterns/index.js'
import type { Output } from './output.js'
import type { Type } from './types.js'
import { Alge } from 'alge'
import { z } from 'zod'

export const Result = Alge.data(`Result`, {
  Success: z.object({
    value: z.any(),
  }),
  Failure: z.object({
    errors: z.array(z.string()),
    value: z.any(),
  }),
})

type $Result = Alge.Infer<typeof Result>

export type Result = $Result['*']

namespace Result {
  export type Success = $Result['Success']
  export type Failure = $Result['Failure']
}

export const validate = (spec: Output, value: any): Result => {
  return Alge.match(spec)
    .Basic((spec) => validateBasic(spec, value))
    .Union((spec) => validateUnion(spec, value))
    .Exclusive((spec) => validateExclusive(spec, value))
    .done()
}

const validateBasic = (spec: Output.Basic, value: unknown): Result => {
  if (value === undefined) {
    if (spec.optionality._tag === `required`) {
      return Result.Failure.create({ value, errors: [`Value is undefined. A value is required.`] })
    }
    return Result.Success.create({ value })
  }
  return validateType(spec.type, value)
}

const validateUnion = (spec: Output.Union, value: unknown): Result => {
  if (value === undefined) {
    if (spec.optionality._tag === `required`) {
      return Result.Failure.create({ value, errors: [`Value is undefined. A value is required.`] })
    }
    return Result.Success.create({ value })
  }
  const type = spec.types.find((member) => validateType(member.type, value))
  if (!type) {
    return Result.Failure.create({ value, errors: [`Value does not fit any member of the union.`] })
  }
  return Result.Success.create({ value })
}

const validateExclusive = (_spec: Output.Exclusive, _value: unknown): Result => {
  // todo do we need this?
  return null as any
}

const validateType = (type: Type, value: unknown): Result => {
  return Alge.match(type)
    .TypeBoolean(() =>
      typeof value === `boolean`
        ? Result.Success.create({ value })
        : Result.Failure.create({ value, errors: [`Value is not a boolean.`] })
    )
    .TypeEnum((type) =>
      type.members.includes(value as any)
        ? Result.Success.create({ value })
        : Result.Failure.create({ value, errors: [`Value is not a member of the enum.`] })
    )
    .TypeNumber((type) => {
      const errors = []
      if (typeof value !== `number`) {
        return Result.Failure.create({ value, errors: [`Value is not a number.`] })
      }
      if (type.int && !Number.isInteger(value)) {
        errors.push(`Value is not an integer.`)
      }
      if (type.min) {
        if (value < type.min) {
          errors.push(`value must be bigger than ${type.min}.`)
        }
      }
      if (type.max) {
        if (value > type.max) {
          errors.push(`value must be smaller than ${type.max}.`)
        }
      }
      if (type.multipleOf) {
        if (value % type.multipleOf !== 0) {
          errors.push(`Value is not a multiple of ${type.multipleOf}.`)
        }
      }
      if (errors.length > 0) {
        return Result.Failure.create({ value, errors })
      }
      return Result.Success.create({ value })
    })
    .TypeString((type) => {
      const errors = []
      if (typeof value !== `string`) {
        return Result.Failure.create({ value, errors: [`Value is not a string.`] })
      }
      if (type.regex && !type.regex.test(value)) {
        errors.push(`Value does not conform to Regular Expression.`)
      }
      if (type.min) {
        if (value.length < type.min) {
          errors.push(`Value is too short.`)
        }
      }
      if (type.max) {
        if (value.length > type.max) {
          errors.push(`Value is too long.`)
        }
      }
      if (type.pattern) {
        Alge.match(type.pattern)
          .cuid(() => {
            if (!Patterns.cuid.test(value)) {
              errors.push(`Value is not a cuid.`)
            }
          })
          .url(() => {
            try {
              new URL(value)
            } catch (error) {
              errors.push(`Value is not a URL.`)
            }
          })
          .email(() => {
            if (!Patterns.email.test(value)) {
              errors.push(`Value is not an email address.`)
            }
          })
          .uuid(() => {
            if (!Patterns.uuid.test(value)) {
              errors.push(`Value is not a uuid.`)
            }
          })
          .dateTime((type) => {
            if (!Patterns.dateTime({ offset: type.offset, precision: type.precision }).test(value)) {
              errors.push(`Value is not a conforming datetime.`)
            }
          })
          .done()
      }
      if (type.startsWith) {
        if (!value.startsWith(type.startsWith)) {
          errors.push(`Value does not start with ${type.startsWith}.`)
        }
      }
      if (type.endsWith) {
        if (!value.endsWith(type.endsWith)) {
          errors.push(`Value does not end with ${type.endsWith}.`)
        }
      }
      if (type.length) {
        if (value.length !== type.length) {
          errors.push(`Value does not have the length ${type.length}.`)
        }
      }
      if (errors.length > 0) {
        return Result.Failure.create({ value, errors })
      }
      return Result.Success.create({ value })
    })
    .done()
}
