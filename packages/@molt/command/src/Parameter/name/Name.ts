import { stripeDashPrefix } from '../../helpers.js'
import { partition } from '../../lib/prelude.js'
import type { BuilderStateMinimum } from '../helpers.js'
import type { FlagName } from '@molt/types'
import camelCase from 'lodash.camelcase'

export type Name<S extends string> = FlagName.Parse<S>

/**
 * Parse the specification for a parameter name.
 */
export const parseExpression = <S extends string>(expression: S): Name<S> => {
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
  const short = (shorts.shift() ?? null)!
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const long = (longs.shift() ?? null)!
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  // const canonical = (long ?? short)!

  return {
    expression,
    // canonical,
    short,
    long,
    aliases: {
      short: shorts,
      long: longs,
    },
  } as any as Name<S>
}

/**
 * Get all the names of a parameter in array form.
 */
export const getNames = (p: BuilderStateMinimum): [string, ...string[]] => {
  const name = getName(p)
  return [
    ...name.aliases.long,
    ...name.aliases.short,
    ...(name.long === null ? [] : [name.long]),
    ...(name.short === null ? [] : [name.short]),
  ] as [string, ...string[]]
}

const getName = (p: BuilderStateMinimum): FlagName.Data.FlagNames => {
  return p.name as any as FlagName.Data.FlagNames
}

export type ValidateExpression<NameExpression extends string> = FlagName.Errors.$Is<
  FlagName.Parse<NameExpression, { usedNames: never; reservedNames: never }>
> extends true
  ? FlagName.Parse<NameExpression, { usedNames: never; reservedNames: never }>
  : NameExpression
