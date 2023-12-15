import { Command, p, t } from '../../src/_entrypoints/default.js'
import { Zod } from '../../src/_entrypoints/extensions.js'
import { isPromiseLikeValue } from '../../src/lib/prelude.js'

// todo enable throw on all tests
export const $ = Command.create().use(Zod) // .settings({ onError: `throw` })

export const assertAssignable = <T>(_: T): [T] => 0 as any // eslint-disable-line
export const as = <T>(): T => undefined as any // eslint-disable-line
export const n = t.number()
export const s = t.string()
export const b = t.boolean()
export const l1 = t.literal(1)
export const e = t.enum([`major`, `minor`, `patch`])
export const pn = p.type(n)
export const ps = p.type(s)
export const pb = p.type(b)
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

export type T<A, B extends A> = { A: A; B: B }
