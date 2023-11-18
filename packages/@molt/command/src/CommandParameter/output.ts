import type { EventPatternsInput } from '../eventPatterns.js'
import type { Pam } from '../lib/Pam/index.js'
import type { Type } from '../Type/index.js'
import type { Name as MoltName } from '@molt/types'

export type Output = Output.Exclusive | Output.Basic //| Output.Union

export namespace Output {
  export type Prompt<T extends Type.Type = Type.Type> = {
    enabled: boolean | null
    when: EventPatternsInput<T> | null
  }

  export interface Basic extends Omit<Pam.Parameter, '_tag'> {
    _tag: 'Basic'
    environment: Environment
    prompt: Prompt
  }

  export type BasicData = Omit<Basic, '_tag' | 'optionality'> & {
    _tag: 'BasicData'
    optionality: BasicOptionality['_tag']
  }

  export interface Exclusive {
    _tag: 'Exclusive'
    name: Name
    type: Type.Type
    description: string | null
    environment: Environment
    group: ExclusiveGroup
  }

  // prettier-ignore
  type BasicOptionality = 
    | { _tag: 'required' }
    | { _tag: 'optional' }
    | { _tag: 'default', getValue: () => Pam.Value }

  export type ExclusiveOptionality =
    | { _tag: 'required' }
    | { _tag: 'optional' }
    | { _tag: 'default'; tag: string; getValue: () => Pam.Value }

  export type Environment = null | { enabled: boolean; namespaces: string[] }

  export type Name = MoltName.Data.NameParsed

  export interface ExclusiveGroup {
    // _tag: 'Exclusive'
    label: string
    optionality: ExclusiveOptionality
    parameters: Record<string, Exclusive>
  }
}
