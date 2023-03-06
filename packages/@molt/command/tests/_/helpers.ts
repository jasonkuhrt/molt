import { z } from 'zod'

export const assertAssignable = <T>(_: T): [T] => 0 as any // eslint-disable-line
export const as = <T>(): T => undefined as any // eslint-disable-line
export const n = z.number()
export const s = z.string()
export const e = z.enum([`major`, `minor`, `patch`])
export const tryCatch = <E extends Error>(fn: () => void): undefined | E => {
  try {
    fn()
    return undefined
  } catch (error) {
    return error as E
  }
}
