import { Zod } from '../../src/_entrypoints/extensions.js'
import { Command } from '../../src/index.js'
import { isPromiseLikeValue } from '../../src/lib/prelude.js'
import { z } from 'zod'

export const $ = Command.create().use(Zod)

export const assertAssignable = <T>(_: T): [T] => 0 as any // eslint-disable-line
export const as = <T>(): T => undefined as any // eslint-disable-line
export const n = z.number()
export const s = z.string()
export const b = z.boolean()
export const l1 = z.literal(1)
export const e = z.enum([`major`, `minor`, `patch`])
export const tryCatch = <T, E extends Error = Error>(
  fn: () => T,
): T extends Promise<any> ? Promise<Awaited<T> | E> : T | E => {
  try {
    const result = fn() as any // eslint-disable-line
    if (isPromiseLikeValue(result)) {
      return result.catch((error) => {
        return errorFromMaybeError(error)
      }) as any
    }
    return result
  } catch (error) {
    return errorFromMaybeError(error) as any
  }
}

/**
 * Ensure that the given value is an error and return it. If it is not an error than
 * wrap it in one, passing the given value as the error message.
 */
export const errorFromMaybeError = (maybeError: unknown): Error => {
  if (maybeError instanceof Error) return maybeError

  if (typeof maybeError === `object` && maybeError !== null) {
    try {
      // todo use isomorphic util inspect
      // maybe https://www.npmjs.com/package/object-inspect?
      return new Error(String(maybeError))
    } catch {
      // silently ignore
    }
  }

  return new Error(String(maybeError))
}
