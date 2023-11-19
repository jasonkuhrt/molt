// import type { EventPatternsInput } from '../eventPatterns.js'
// import type { Pam } from '../lib/Pam/index.js'
// import type { Type } from '../Type/index.js'
// import type { Name as MoltName } from '@molt/types'

// export type Output = Output.Exclusive | Output.Basic //| Output.Union

// export namespace Output {
//   export type Prompt<T extends Type.Type = Type.Type> = {
//     enabled: boolean | null
//     when: EventPatternsInput<T> | null
//   }

//   // prettier-ignore
//   type BasicOptionality =
//     | { _tag: 'required' }
//     | { _tag: 'optional' }
//     | { _tag: 'default', getValue: () => Pam.Value }

//   export type Environment = null | { enabled: boolean; namespaces: string[] }

//   export type Name = MoltName.Data.NameParsed
// }
