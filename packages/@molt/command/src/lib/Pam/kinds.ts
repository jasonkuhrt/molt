import type { Value } from './types.js'

export type Type = Type.Union | Type.Scalar

export namespace Type {
  export interface Union {
    _tag: 'TypeUnion'
    members: {
      type: Type
      description: string | null
    }[]
  }

  export type Scalar = Scalar.Literal | Scalar.Boolean | Scalar.Enumeration | Scalar.String | Scalar.Number
  export namespace Scalar {
    export interface Literal {
      _tag: 'TypeLiteral'
      value: Value
    }

    export interface Boolean {
      _tag: 'TypeBoolean'
    }

    export interface Enumeration {
      _tag: 'TypeEnum'
      members: (number | string)[]
    }

    export interface String {
      _tag: 'TypeString'
      transformations?: {
        trim?: boolean
        toCase?: 'upper' | 'lower'
      }
      regex?: RegExp
      min?: number
      max?: number
      length?: number
      pattern?:
        | {
            type: 'email'
          }
        | {
            type: 'url'
          }
        | {
            type: 'uuid'
          }
        | {
            type: 'cuid'
          }
        | {
            type: 'cuid2'
          }
        | {
            type: 'ulid'
          }
        | {
            type: 'emoji'
          }
        | {
            type: 'ip'
            /**
             * If `null` then either IPv4 or IPv6 is allowed.
             */
            version: 4 | 6 | null
          }
        | {
            type: 'dateTime'
            offset: boolean
            precision: null | number
          }
      startsWith?: string
      endsWith?: string
      includes?: string
    }

    export interface Number {
      _tag: 'TypeNumber'
      int?: boolean
      min?: number
      max?: number
      multipleOf?: number
      finite?: boolean
    }
  }
}
