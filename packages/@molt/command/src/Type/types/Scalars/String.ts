import { Alge } from 'alge'
import { Effect, Either } from 'effect'
import { casesExhausted, entries } from '../../../helpers.js'
import { Patterns } from '../../../lib/Patterns/index.js'
import { PromptEngine } from '../../../lib/PromptEngine/PromptEngine.js'
import { Tex } from '../../../lib/Tex/index.js'
import { Term } from '../../../term.js'
import type { Optionality } from '../../helpers.js'
import { runtimeIgnore, type Type, TypeSymbol } from '../../helpers.js'

export interface String extends Type<string> {
  _tag: 'TypeString'
  refinements: StringRefinements
  transformations: StringTransformations
}

type String_ = String // eslint-disable-line

export interface StringTransformations {
  trim?: boolean
  toCase?: 'upper' | 'lower'
}

export interface StringRefinements {
  min?: number
  max?: number
  length?: number
  startsWith?: string
  endsWith?: string
  includes?: string
  regex?: RegExp
  pattern?:
    | {
        type: 'email'
      }
    | {
        type: 'url'
      }
    | {
        type: 'uuid'
      }
    | {
        type: 'cuid'
      }
    | {
        type: 'cuid2'
      }
    | {
        type: 'ulid'
      }
    | {
        type: 'emoji'
      }
    | {
        type: 'ip'
        /**
         * If `null` then either IPv4 or IPv6 is allowed.
         */
        version: 4 | 6 | null
      }
    | {
        type: 'dateTime'
        offset: boolean
        precision: null | number
      }
}

// string().pattern(`dateTime`, { offset: true })

export const string = ({
  refinements,
  transformations,
  description,
  optionality,
}: {
  optionality: Optionality<string>
  refinements?: StringRefinements
  transformations?: StringTransformations
  description?: string
}): String_ => {
  const type: String_ = {
    _tag: `TypeString`,
    priority: -10,
    refinements: refinements ?? {},
    transformations: transformations ?? {},
    description: description ?? null,
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    optionality,
    display: () => Term.colors.positive(`string`),
    displayExpanded: () => type.display(),
    help: () => {
      return Tex.block(($) =>
        $.block(type.displayExpanded()).block(description ?? null),
      ) as Tex.Block
    },
    deserialize: (rawValue) => Either.right(rawValue),
    validate: (value) => {
      if (optionality._tag === `optional` && value === undefined)
        return Either.right(value)
      const errors: string[] = []

      if (typeof value !== `string`)
        return Either.left({ value, errors: [`Value is not a string.`] })
      if (!refinements) return Either.right(value)

      if (refinements.regex && !refinements.regex.test(value)) {
        errors.push(`Value does not conform to Regular Expression.`)
      }
      if (refinements.min) {
        if (value.length < refinements.min) {
          errors.push(`Value is too short.`)
        }
      }
      if (refinements.max) {
        if (value.length > refinements.max) {
          errors.push(`Value is too long.`)
        }
      }
      if (refinements.includes) {
        if (!value.includes(refinements.includes)) {
          errors.push(`Value does not include ${refinements.includes}.`)
        }
      }

      if (refinements.pattern) {
        Alge.match(refinements.pattern)
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
            if (
              !Patterns.dateTime({
                offset: type.offset,
                precision: type.precision,
              }).test(value)
            ) {
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

      if (refinements.startsWith) {
        if (!value.startsWith(refinements.startsWith)) {
          errors.push(`Value does not start with ${refinements.startsWith}.`)
        }
      }
      if (refinements.endsWith) {
        if (!value.endsWith(refinements.endsWith)) {
          errors.push(`Value does not end with ${refinements.endsWith}.`)
        }
      }
      if (refinements.length) {
        if (value.length !== refinements.length) {
          errors.push(`Value does not have the length ${refinements.length}.`)
        }
      }
      if (errors.length > 0) {
        return Either.left({ value, errors })
      }

      return Either.right(value)
    },
    transform: (value) => {
      if (!transformations) return value

      return entries(transformations ?? {}).reduce(
        (_value, [kind, kindValue]) => {
          return kind === `trim`
            ? _value.trim()
            : kind === `toCase`
            ? kindValue === `upper`
              ? _value.toUpperCase()
              : _value.toLowerCase()
            : casesExhausted(kind)
        },
        value,
      )
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
                  value:
                    event.name === `backspace`
                      ? state.value.slice(0, -1)
                      : state.value + event.sequence,
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
        return state.value
      }),
  }
  return type
}
