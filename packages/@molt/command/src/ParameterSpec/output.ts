import type { ZodHelpers } from '../lib/zodHelpers/index.js'
import type { ArgumentValue, SomeBasicZodType } from './types.js'

export type Output = Output.Exclusive | Output.Basic //| Output.Union

export namespace Output {
  export interface Basic {
    _tag: 'Basic'
    name: Name
    type: SomeBasicZodType
    typePrimitiveKind: ZodHelpers.Primitive
    optionality: BasicOptionality
    description: null | string
    environment: Environment
  }

  export interface Union {
    _tag: 'Union'
    name: Name
    types: {
      type: SomeBasicZodType
      typePrimitiveKind: ZodHelpers.Primitive
    }[]
    optionality: BasicOptionality
    description: null | string
    environment: Environment
  }

  export interface Exclusive {
    _tag: 'Exclusive'
    name: Name
    type: SomeBasicZodType
    typePrimitiveKind: ZodHelpers.Primitive
    description: string | null
    environment: Environment
    group: ExclusiveGroup
  }

  // prettier-ignore
  export type BasicOptionality = 
    | { _tag: 'required' }
    | { _tag: 'optional' }
    | { _tag: 'default', getValue: () => ArgumentValue }

  export type ExclusiveOptionality =
    | { _tag: 'required' }
    | { _tag: 'optional' }
    | { _tag: 'default'; tag: string; getValue: () => ArgumentValue }

  export type Environment = null | { enabled: boolean; namespaces: string[] }

  export interface Name {
    canonical: string
    aliases: {
      short: string[]
      long: string[]
    }
    short: null | string
    long: null | string
  }

  export interface ExclusiveGroup {
    // _tag: 'Exclusive'
    label: string
    optionality: ExclusiveOptionality
    parameters: Record<string, Exclusive>
  }
}
