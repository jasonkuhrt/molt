export type ValidationResult<T> = ValidationResult.Success<T> | ValidationResult.Failure<T>

export namespace ValidationResult {
  export interface Success<T> {
    _tag: 'Success'
    value: T
  }

  export const Success = <T>(value: T): Success<T> => ({ _tag: `Success`, value })

  export interface Failure<T> {
    _tag: 'Failure'
    errors: string[]
    value: T
  }

  export const Failure = <T>(value: T, errors: string[]): Failure<T> => ({ _tag: `Failure`, value, errors })
}
