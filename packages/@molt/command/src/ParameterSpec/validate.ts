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
      if (errors.length > 0) {
        return Result.Failure.create({ value, errors })
      }
      return Result.Success.create({ value })
    })
    .done()
}
