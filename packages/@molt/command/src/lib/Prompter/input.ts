import type { Pam } from '../Pam/index.js'
import type { PromptEngine } from '../PromptEngine/PromptEngine.js'

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

  return params.parameter.type.prompt({
    ...params,
    optionality: params.parameter.optionality,
  })
}
