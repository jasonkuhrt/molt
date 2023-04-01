import type { Errors } from '../Errors/index.js'
import type { Pattern } from '../Pattern/Pattern.js'
import type { Output } from './output.js'
import type {
  ArgumentValue,
  ArgumentValueScalar,
  SomeBasicType,
  SomeExclusiveZodType,
  SomeUnionType,
} from './types.js'

export type Input = Input.Basic | Input.Exclusive | Input.Union

export namespace Input {
  export interface EventPattern {
    when: {
      rejected?: Pattern<{
        // todo more errors, like duplicate
        name: (Errors.ErrorMissingArgument | Errors.ErrorInvalidArgument)['name']
      }>
      supplied?: Pattern<{
        // todo value should be type safe according to passed generic
        value: ArgumentValue
      }>
      // todo this field should only be allowed if the parameter spec is optional or has a default
      omitted?: Pattern<{
        optionality: Exclude<Output.BasicOptionality['_tag'], 'required'>
      }>
    }
  }

  export type Prompt = null | boolean | EventPattern

  export interface Basic {
    _tag: 'Basic'
    nameExpression: string
    type: SomeBasicType
    prompt: Prompt
  }

  export interface Exclusive {
    _tag: 'Exclusive'
    optionality:
      | { _tag: 'required' }
      | { _tag: 'optional' }
      | { _tag: 'default'; tag: string; value: ArgumentValueScalar | (() => ArgumentValueScalar) }
    description?: string
    parameters: {
      nameExpression: string
      type: SomeExclusiveZodType
    }[]
  }

  export interface Union {
    _tag: 'Union'
    description?: string
    nameExpression: string
    type: SomeUnionType
  }
}
