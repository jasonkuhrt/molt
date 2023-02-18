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
}

export interface TypeNumber {
  _tag: 'TypeNumber'
}
