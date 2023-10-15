import { casesExhausted } from '../../../helpers.js'
import type { Pam } from '../../Pam/index.js'
import type { PromptEngine } from '../../PromptEngine/PromptEngine.js'
import * as Inputs from './types/index.js'

export interface InputParams<parameter extends Pam.Parameter> {
  channels: PromptEngine.Channels
  prompt: string
  marginLeft?: number
  parameter: parameter
}

export const inputForParameter = (parameter: Pam.Parameter) => {
  if (parameter.type._tag === `TypeLiteral`) {
    throw new Error(`Literals are not supported yet.`)
  }

  if (parameter.type._tag === `TypeUnion`) {
    // @ts-expect-error todo
    return Inputs.union(p)
  }

  if (parameter.type._tag === `TypeBoolean`) {
    // @ts-expect-error todo
    return Inputs.boolean(p)
  }

  if (parameter.type._tag === `TypeString`) {
    // @ts-expect-error todo
    return Inputs.string(p)
  }

  if (parameter.type._tag === `TypeNumber`) {
    // @ts-expect-error todo
    return Inputs.number(p)
  }

  if (parameter.type._tag === `TypeEnum`) {
    // @ts-expect-error todo
    return Inputs.enumeration(p)
  }

  throw casesExhausted(parameter.type)
}
