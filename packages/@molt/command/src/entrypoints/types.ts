import type { SomeParametersConfig, SomeParametersConfigSchema } from '../Builder/root/types.js'

export type { Settings } from '../Settings/index.js'

export namespace Methods {
  export namespace Parameters {
    export type InputAsSchema = SomeParametersConfigSchema
    export type InputAsConfig = SomeParametersConfig
    export type Input = SomeParametersConfigSchema | SomeParametersConfig
  }
}
