import type { Pam } from '../lib/Pam/index.js'
import { Patterns } from '../lib/Patterns/index.js'
import type { Output } from './output.js'
import { Alge } from 'alge'
import { Either } from 'effect'

type ValidationResult<T> = Either.Either<{ value: T; errors: string[] }, T>

export const validate = <T>(spec: Output, value: T): ValidationResult<T> => {
  return Alge.match(spec)
    .Basic((spec) => validateBasic(spec, value))
    .Exclusive((spec) => validateExclusive(spec, value))
    .done()
}

const validateBasic = <T>(spec: Output.Basic, value: T): ValidationResult<T> => {
  if (value === undefined) {
    if (spec.optionality._tag === `required`) {
      return Either.left({ value, errors: [`Value is undefined. A value is required.`] })
    }
    return Either.right(value)
  }
  return validateType(spec.type, value)
}

const validateExclusive = <T>(_spec: Output.Exclusive, _value: T): ValidationResult<T> => {
  // todo do we need this?
  return null as any
}

const validateType = <T>(type: Pam.Type, value: T): ValidationResult<T> => {
  return Alge.match(type)
    .TypeLiteral((_) =>
      value === _.value
        ? Either.right(value)
        : Either.left({ value, errors: [`Value is not equal to literal.`] }),
    )
    .TypeBoolean(() =>
      typeof value === `boolean`
        ? Either.right(value)
        : Either.left({ value, errors: [`Value is not a boolean.`] }),
    )
    .TypeEnum((type) =>
      type.members.includes(value as any)
        ? Either.right(value)
        : Either.left({ value, errors: [`Value is not a member of the enum.`] }),
    )
    .TypeNumber((type) => {
      const errors = []
      if (typeof value !== `number`) {
        return Either.left({ value, errors: [`Value is not a number.`] })
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
        return Either.left({ value, errors })
      }
      return Either.right(value)
    })
    .TypeString((type) => {
      const errors = []
      if (typeof value !== `string`) {
        return Either.left({ value, errors: [`Value is not a string.`] })
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
      if (type.includes) {
        if (!value.includes(type.includes)) {
          errors.push(`Value does not include ${type.includes}.`)
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
          .ulid(() => {
            if (!Patterns.ulid.test(value)) {
              errors.push(`Value is not a ulid.`)
            }
          })
          .dateTime((type) => {
            if (!Patterns.dateTime({ offset: type.offset, precision: type.precision }).test(value)) {
              errors.push(`Value is not a conforming datetime.`)
            }
          })
          .cuid2(() => {
            if (!Patterns.cuid2.test(value)) {
              errors.push(`Value is not a cuid2.`)
            }
          })
          .ip((type) => {
            const ip4 = Patterns.ipv4.test(value)
            if (type.version === 4 && !ip4) {
              errors.push(`Value is not an ipv4 address.`)
              return
            }
            const ip6 = Patterns.ipv6.test(value)
            if (type.version === 6 && !ip6) {
              errors.push(`Value is not an ipv6 address.`)
              return
            }
            if (!ip4 && !ip6) {
              errors.push(`Value is not an ipv4 or ipv6 address.`)
            }
          })
          .emoji(() => {
            if (!Patterns.emoji.test(value)) {
              errors.push(`Value is not an emoji.`)
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
        return Either.left({ value, errors })
      }
      return Either.right(value)
    })
    .TypeUnion((type) => {
      const result = type.members.find((member) => validateType(member.type, value))
      if (!result) {
        return Either.left({ value, errors: [`Value does not fit any member of the union.`] })
      }
      return Either.right(value)
    })
    .done()
}
