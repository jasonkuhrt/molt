import { produce } from 'immer'
import { Either } from 'effect'
import camelCase from 'lodash.camelcase'

export const BooleanLookup = {
  true: true,
  false: false,
} as const

export const environmentVariableBooleanLookup = {
  ...BooleanLookup,
  '1': true,
  '0': false,
} as const

export const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

export type Values<T> = T[keyof T]

export const getLowerCaseEnvironment = (): NodeJS.ProcessEnv =>
  lowerCaseObjectKeys(process.env)

export const lowerCaseObjectKeys = (obj: object) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]))

export const parseEnvironmentVariableBoolean = (
  serializedValue: string,
): Either.Either<Error, boolean> => {
  // @ts-expect-error ignore
  // eslint-disable-next-line
  const value = environmentVariableBooleanLookup[serializedValue]
  if (value === undefined)
    return Either.left(new Error(`Invalid boolean value: ${value}`))
  return Either.right(value)
}

export const parseEnvironmentVariableBooleanOrThrow = (value: string) => {
  const result = parseEnvironmentVariableBoolean(value)
  if (Either.isLeft(result)) {
    throw result.left
  }
  return result.right
}

export const negateNamePattern = /^no([A-Z].+)/

export const stripeNegatePrefix = (name: string): null | string => {
  // eslint-disable-next-line
  const withoutPrefix = name.match(negateNamePattern)?.[1]!
  if (!withoutPrefix) return null
  const withCamelCase = camelCase(withoutPrefix)
  return withCamelCase
}

export const stripeNegatePrefixLoose = (name: string): string => {
  const result = stripeNegatePrefix(name)
  return result ? result : name
}

export const invertTable = <T>(rows: T[][]): T[][] => {
  const columns: T[][] = []
  for (const row of rows) {
    let i = 0
    for (const col of row) {
      const column = columns[i] || []
      column.push(col)
      columns[i] = column
      i++
    }
  }
  return columns
}

export const entries = <O extends object>(
  obj: O,
): Exclude<{ [k in keyof O]: [k, O[k]] }[keyof O], undefined>[] =>
  Object.entries(obj) as any

export const casesExhausted = (_: never): never => {
  throw new Error(`Cases exhausted: ${_}`) // eslint-disable-line
}

export namespace HKT {
  /**
   * Model a Higher Kinded Type (HKT).
   */
  export interface Fn<Params = unknown, Return = unknown> {
    params: Params
    return: Return
  }

  /**
   * Apply a Higher Kinded Type (HKT).
   */
  export type Call<F extends Fn, P> = (F & { params: P })['return']

  export type ID<T> = IDFn<T>

  export interface IDFn<T> extends HKT.Fn<T> {
    return: this['params']
  }
}

export const createUpdater =
  <$State, $Builder extends (state: $State) => unknown>(params: {
    state: $State
    builder: $Builder
  }) =>
  <$Args extends unknown[]>(
    pathExpression: string,
    updater?: (...args: $Args) => unknown,
  ) =>
  (...args: $Args) => {
    return params.builder(
      produce(params.state, (draft) => {
        const path = pathExpression.split(`.`)
        const objectPath = path.slice(0, -1)
        const valuePath = path.slice(-1)
        const object = objectPath.reduce((acc, key) => {
          // @ts-expect-error fixme
          if (acc[key] === undefined) acc[key] = {}
          // @ts-expect-error fixme
          return acc[key]
        }, draft)
        // @ts-expect-error fixme
        object[valuePath] = updater?.(...args) ?? args[0]
      }),
    )
  }

export type SetObjectProperty<
  $Obj extends object,
  $P extends string | symbol | number,
  $V,
> = Omit<$Obj, $P> & {
  [_ in $P]: $V
}

export type UpdateObjectProperty<
  $Obj extends object,
  $P extends keyof $Obj,
  $V extends $Obj[$P],
> = Omit<$Obj, $P> & {
  [_ in $P]: $V
}

export type UpdateObject<
  $ObjA extends object,
  $ObjB extends Partial<$ObjA>,
> = Omit<$ObjA, keyof $ObjB> & $ObjB
