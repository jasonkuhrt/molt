import type { EventPatternsInput } from '../eventPatterns.js'
import type { Pam } from '../lib/Pam/index.js'
import type { CommandParameter } from './index.js'

export type Output = Output.Exclusive | Output.Basic //| Output.Union

export namespace Output {
  export type Prompt<S extends CommandParameter.Input.Schema = CommandParameter.Input.Schema> = {
    enabled: boolean | null
    when: EventPatternsInput<S> | null
  }

  export interface Basic extends Omit<Pam.Parameter.Single, '_tag'> {
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
    type: Pam.Type
    description: string | null
    environment: Environment
    group: ExclusiveGroup
  }

  // prettier-ignore
  export type BasicOptionality = 
    | { _tag: 'required' }
    | { _tag: 'optional' }
    | { _tag: 'default', getValue: () => Pam.Value }

  export type ExclusiveOptionality =
    | { _tag: 'required' }
    | { _tag: 'optional' }
    | { _tag: 'default'; tag: string; getValue: () => Pam.Value }

  export type Environment = null | { enabled: boolean; namespaces: string[] }

  export interface Name {
    canonical: string
    aliases: {
      short: string[]
      long: string[]
    }
    short: null | string
    long: null | string
  }

  export interface ExclusiveGroup {
    // _tag: 'Exclusive'
    label: string
    optionality: ExclusiveOptionality
    parameters: Record<string, Exclusive>
  }
}
