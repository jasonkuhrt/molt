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
import type { z } from 'zod'

export type Input = Input.Basic | Input.Exclusive | Input.Union

export namespace Input {
  export interface EventPattern<S extends Schema> {
    // prettier-ignore
    when: {
      // todo more errors, like duplicate
      rejected?: Pattern<Pick<Errors.ErrorMissingArgument|Errors.ErrorInvalidArgument, 'name'>>
      // todo value should be type safe according to passed generic
      supplied?: Pattern<{ value: ArgumentValue }>
    } & (
      // todo recursively unpack to find out if optional or default is present
      S['_def']['typeName'] extends z.ZodFirstPartyTypeKind.ZodOptional ? { omitted?: Pattern<{ optionality: Exclude<Output.BasicOptionality['_tag'], 'required'> }> } : 
      S['_def']['typeName'] extends z.ZodFirstPartyTypeKind.ZodDefault  ? { omitted?: Pattern<{ optionality: Exclude<Output.BasicOptionality['_tag'], 'required'> }> } :
                                                                               {
                                                                                 /** Not available. Matching on the `omitted` event type is only possible when the parameter is optional or has a default value. */
                                                                                 omitted?:  'Not Available. Only when parameter optional or has default.'
                                                                               }
    )
  }

  export type Schema = SomeBasicType | SomeUnionType

  export type Prompt<S extends Schema> = null | boolean | EventPattern<S>

  export interface Basic {
    _tag: 'Basic'
    nameExpression: string
    type: SomeBasicType
    prompt: Prompt<SomeBasicType>
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
