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
  // TODO validate these
  min?: number
  max?: number
  length?: number
  pattern?: 'email' | 'url' | 'uuid' | 'cuid'
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
