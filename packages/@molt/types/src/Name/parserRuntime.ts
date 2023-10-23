import { partition, stripeDashPrefix } from '../prelude.js'
import type { NameParsed } from './data.js'
import camelCase from 'lodash.camelcase'

export const parse = (expression: string): NameParsed => {
  const names = expression
    .trim()
    .split(` `)
    .map((_) => _.trim())
    .map(stripeDashPrefix)
    .map(camelCase)
    .filter((_) => _.length > 0)

  const [longs, shorts] = partition(names, (name) => name.length > 1)

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
  const canonical = (long ?? short)!

  return {
    expression,
    canonical,
    short,
    long,
    aliases: {
      short: shorts,
      long: longs,
    },
  }
}
