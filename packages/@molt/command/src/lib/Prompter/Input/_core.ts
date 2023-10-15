import { casesExhausted } from '../../../helpers.js'
import type { Pam } from '../../Pam/index.js'
import type { PromptEngine } from '../../PromptEngine/PromptEngine.js'
import * as Inputs from './types/index.js'

export interface Params<parameter extends Pam.Parameter> {
  channels: PromptEngine.Channels
  prompt: string
  marginLeft?: number
  parameter: parameter
}

export const inputForParameter = (params: Params<Pam.Parameter>) => {
  const { parameter } = params

  if (parameter.type._tag === `TypeLiteral`) {
    throw new Error(`Literals are not supported yet.`)
  }

  if (parameter.type._tag === `TypeUnion`) {
    return Inputs.union(params as Params<Pam.Parameter<Pam.Type.Union>>)
  }

  if (parameter.type._tag === `TypeBoolean`) {
    return Inputs.boolean(params as Params<Pam.Parameter<Pam.Type.Scalar.Boolean>>)
  }

  if (parameter.type._tag === `TypeString`) {
    return Inputs.string(params as Params<Pam.Parameter<Pam.Type.Scalar.String>>)
  }

  if (parameter.type._tag === `TypeNumber`) {
    return Inputs.number(params as Params<Pam.Parameter<Pam.Type.Scalar.Number>>)
  }

  if (parameter.type._tag === `TypeEnum`) {
    return Inputs.enumeration(params as Params<Pam.Parameter<Pam.Type.Scalar.Enumeration>>)
  }

  throw casesExhausted(parameter.type)
}
