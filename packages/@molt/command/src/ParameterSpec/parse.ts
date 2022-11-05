import { stripeDashPrefix } from '../helpers.js'
import { partition } from '../lib/prelude.js'
import { ZodHelpers } from '../lib/zodHelpers/index.js'
import type { Settings } from '../Settings/index.js'
import type { ParameterSpec } from './index.js'
import { Input } from './input.js'
import { Normalized } from './normalized.js'
import type { SomeInputs } from './ParametersSpec.js'
import { Alge } from 'alge'
import camelCase from 'lodash.camelcase'
import { z } from 'zod'

/**
 * Process the spec input into a normalized spec.
 */
export const parse = (inputs: SomeInputs, settings: Settings.Normalized): Normalized[] => {
  const inputsWithHelp: SomeInputs = settings.help
    ? {
        ...inputs,
        '-h --help': Input.Basic.create({ type: z.boolean().default(false) }),
      }
    : inputs
  return Object.entries(inputsWithHelp).flatMap(([expression, input]): Normalized[] =>
    Alge.match(input)
      .Basic((_) => [parseBasic(expression, _, settings)])
      .Exclusive((_) => parseExclusive(expression, _, settings))
      .done()
  )
}

const parseExpression = (
  expression: string
): {
  shorts: string[]
  longs: string[]
  canonical: string
  canonicalShort: string
  canonicalLong: string
} => {
  const names = expression
    .trim()
    .split(` `)
    .map((exp) => exp.trim())
    .map(stripeDashPrefix)
    .map(camelCase)
    .filter((exp) => exp.length > 0)

  const [shorts, longs] = partition(names, (name) => name.length > 1)

  // User should static error before hitting this at runtime thanks to
  // @molt/types.
  if (shorts.length === 0 && longs.length === 0) {
    throw new Error(`Invalid parameter expression: ${expression}`)
  }

  /**
   * Pick the first of both short/long groups as being the canonical forms of either group.
   * Then get the overall canonical name for the parameter.
   *
   * We've checked about that both groups are not empty. Therefore we know we will have at least
   * one name that thus satisfies the return type. Its tricky to convince TS of the union though
   * so we just use non-null type casts on all the following name values.
   */
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const canonicalShort = (shorts.shift() ?? null)!
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const canonicalLong = (longs.shift() ?? null)!
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const canonical = (canonicalLong ?? canonicalShort)!

  return {
    shorts,
    longs,
    canonical,
    canonicalShort,
    canonicalLong,
  }
}

const parseExclusive = (
  label: string,
  input: Input.Exclusive,
  settings: Settings.Normalized
): Normalized.Exclusive[] => {
  const group: ParameterSpec.Exclusive = {
    label,
    optional: input.optional,
    values: {},
  }

  const values = input.values.map((_) => {
    const { canonical, longs, shorts, canonicalLong, canonicalShort } = parseExpression(_.nameExpression)
    const hasEnvironment =
      settings.parameters.environment[canonical]?.enabled ?? settings.parameters.environment.$default.enabled
    return Normalized.Exclusive.create({
      description: _.type.description ?? null,
      type: _.type,
      environment: hasEnvironment
        ? {
            enabled: hasEnvironment,
            namespaces: (
              settings.parameters.environment[canonical]?.prefix ??
              settings.parameters.environment.$default.prefix
            ).map((_) => camelCase(_)),
          }
        : null,
      name: {
        canonical: canonical,
        long: canonicalLong,
        short: canonicalShort,
        aliases: {
          long: longs,
          short: shorts,
        },
      },
      // See comment/code below.
      group: { label: ``, optional: true, values: {} },
      typePrimitiveKind: ZodHelpers.ZodPrimitiveToPrimitive[ZodHelpers.getZodPrimitive(_.type)],
    })
  })

  /**
   * Link up the group to each value and vice versa. Cannot do this in the above constructor since
   * it would create a copy of group for each value.
   */
  values.forEach((_) => {
    _.group = group
    group.values[_.name.canonical] = _
  })

  return values
}

const parseBasic = (
  expression: string,
  input: Input.Basic,
  settings: Settings.Normalized
): Normalized.Basic => {
  const { canonical, longs, shorts, canonicalLong, canonicalShort } = parseExpression(expression)

  // TODO check how to actually do this.
  const isOptional = ZodHelpers.isOptional(input.type)

  // TODO check how to actually do this.
  // eslint-disable-next-line
  // @ts-expect-error todo
  const hasDefault = typeof input.type._def.defaultValue !== `undefined`

  const hasEnvironment =
    settings.parameters.environment[canonical]?.enabled ?? settings.parameters.environment.$default.enabled

  return Normalized.Basic.create({
    type: input.type,
    description: input.type.description ?? null,
    optional: isOptional,
    default: hasDefault
      ? {
          // @ts-expect-error todo
          // eslint-disable-next-line
          get: () => input.type._def.defaultValue(),
        }
      : null,
    typePrimitiveKind: ZodHelpers.ZodPrimitiveToPrimitive[ZodHelpers.getZodPrimitive(input.type)],
    environment: hasEnvironment
      ? {
          enabled: hasEnvironment,
          namespaces: (
            settings.parameters.environment[canonical]?.prefix ??
            settings.parameters.environment.$default.prefix
          ).map((_) => camelCase(_)),
        }
      : null,
    name: {
      canonical: canonical,
      long: canonicalLong,
      short: canonicalShort,
      aliases: {
        long: longs,
        short: shorts,
      },
    },
  })
}
