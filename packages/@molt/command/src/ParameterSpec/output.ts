import type { ArgumentValue, SomeBasicType, SomeUnionType } from './types.js'

export type Output = Output.Exclusive | Output.Basic | Output.Union

export type PrimitiveKind = 'boolean' | 'number' | 'string'

export namespace Output {
  export interface Basic {
    _tag: 'Basic'
    name: Name
    zodType: SomeBasicType
    typePrimitiveKind: PrimitiveKind
    optionality: BasicOptionality
    description: null | string
    environment: Environment
  }

  export interface Union {
    _tag: 'Union'
    name: Name
    zodType: SomeUnionType
    types: {
      type: SomeBasicType
      description: null | string
      typePrimitiveKind: PrimitiveKind
    }[]
    optionality: BasicOptionality
    description: null | string
    environment: Environment
  }

  export interface Exclusive {
    _tag: 'Exclusive'
    name: Name
    zodType: SomeBasicType
    typePrimitiveKind: PrimitiveKind
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
