export * from './zod.js'

export type ArgumentValue = string | boolean | number

export type Type = TypeEnum | TypeString | TypeNumber | TypeBoolean

export interface TypeBoolean {
  _tag: 'TypeBoolean'
}

export interface TypeEnum {
  _tag: 'TypeEnum'
  members: string[]
}

export interface TypeString {
  _tag: 'TypeString'
  regex?: RegExp
  min?: number
  max?: number
  length?: number
  pattern?:
    | {
        _tag: 'email'
      }
    | {
        _tag: 'url'
      }
    | {
        _tag: 'uuid'
      }
    | {
        _tag: 'cuid'
      }
    | {
        _tag: 'dateTime'
        offset: boolean
        precision: null | number
      }
  startsWith?: string
  endsWith?: string
}

export interface TypeNumber {
  _tag: 'TypeNumber'
  int?: boolean
  // TODO validate these
  min?: number
  max?: number
  multipleOf?: number
  finite?: boolean
}
