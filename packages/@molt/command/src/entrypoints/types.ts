import type { Schema, SomeParametersConfig, SomeParametersConfigSchema } from '../Builder/root/types.js'

export type { Settings } from '../Settings/index.js'

export namespace Methods {
  export namespace Parameters {
    export type InputAsSchema = SomeParametersConfigSchema
    export const parameters = <T extends Schema>(
      parameters: SomeParametersConfig<T>,
    ): SomeParametersConfig<T> => parameters
    export type InputAsConfig<T extends Schema> = SomeParametersConfig<T>
  }
}
