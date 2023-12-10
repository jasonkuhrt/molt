import type { Pam } from '../../lib/Pam/index.js'
import type { BuilderParameterExclusiveState, State } from './state.js'
import { createState } from './state.js'
import type { HKT } from '../../helpers.js'
import { PrivateData } from '../../lib/PrivateData/PrivateData.js'
import type { BuilderCommandState } from '../CommandBuilder/stateOld.js'

// export interface ExclusiveParameterConfiguration<
//   $State extends BuilderCommandState.Base,
// > {
//   type: $State['Type']
// }

// interface Parameter<
//   $State extends BuilderCommandState.Base,
//   Label extends string,
// > {
//   <
//     NameExpression extends string,
//     Configuration extends ExclusiveParameterConfiguration<$State>,
//   >(
//     name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
//     configuration: Configuration,
//   ): BuilderExclusiveInitial<
//     BuilderCommandState.AddExclusiveParameter<
//       $State,
//       Label,
//       NameExpression,
//       Configuration
//     >,
//     Label
//   >

//   <NameExpression extends string, $Type extends $State['Type']>(
//     name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
//     type: $Type,
//   ): // BuilderCommandState.AddExclusiveParameter<$State, Label, NameExpression, { type: $Type }>
//   BuilderExclusiveInitial<
//     BuilderCommandState.AddExclusiveParameter<
//       $State,
//       Label,
//       NameExpression,
//       { type: $Type }
//     >,
//     Label
//   >
// }

// export type BuilderExclusiveInitial<
//   $State extends BuilderCommandState.Base,
//   Label extends string,
// > = PrivateData.SetupHost<
//   $State,
//   {
//     parameter: Parameter<$State, Label>
//     optional: () => BuilderExclusiveAfterOptional<
//       BuilderCommandState.SetExclusiveOptional<$State, Label, true>
//     >
//     default: <
//       Tag extends keyof $State['ParametersExclusive'][Label]['Parameters'],
//     >(
//       tag: Tag,
//       value: Type.Infer<
//         $State['ParametersExclusive'][Label]['Parameters'][Tag]['Type']
//       >,
//     ) => BuilderExclusiveAfterDefault<
//       BuilderCommandState.SetExclusiveOptional<$State, Label, false>
//     >
//   }
// >

// export type BuilderExclusiveAfterOptional<
//   $State extends BuilderCommandState.Base,
// > = PrivateData.SetupHost<$State, {}>

// export type BuilderExclusiveAfterDefault<
//   $State extends BuilderCommandState.Base,
// > = PrivateData.SetupHost<$State, {}>

// export interface SomeParameter<$State extends BuilderCommandState.Base> {
//   (nameExpression: any, type: $State['Type']): any // eslint-disable-line
//   (
//     nameExpression: any,
//     configuration: ExclusiveParameterConfiguration<$State>,
//   ): any // eslint-disable-line
// }

// export type SomeBuilderExclusiveInitial<
//   $State extends BuilderCommandState.Base = BuilderCommandState.Initial,
// > = PrivateData.SetupHost<
//   $State,
//   {
//     parameter: SomeParameter<$State>
//     optional: any // eslint-disable-line
//     default: (tag: any, value: any) => any // eslint-disable-line
//   }
// >

// export type BuilderMutuallyExclusiveAfterOptional<
//   $State extends BuilderCommandState.Base,
// > = BuilderExclusiveAfterOptional<$State>

// type Builder<$State extends BuilderCommandState.Base> =
//   | SomeBuilderExclusiveInitial<$State>
//   | BuilderMutuallyExclusiveAfterOptional<$State>
//

interface Builder<$State extends State.Base> {}

interface BuilderFn extends HKT.Fn {
  return: Builder<this['params']>
}

export const create = (
  label: string,
  commandState: BuilderCommandState,
): SomeBuilderExclusiveInitial => {
  return create_(commandState, createState(label))
}

const create_ = (
  commandState: BuilderCommandState,
  state: BuilderParameterExclusiveState,
): SomeBuilderExclusiveInitial => {
  const builder: SomeBuilderExclusiveInitial = PrivateData.set(state, {
    parameter: (nameExpression: string, typeOrConfiguration) => {
      const configuration = `type` in typeOrConfiguration ? typeOrConfiguration : { type: typeOrConfiguration } //  prettier-ignore
      const newState = {
        ...state,
        parameters: [
          ...state.parameters,
          {
            nameExpression,
            type: commandState.typeMapper(configuration.type),
          },
        ],
      }
      return create_(commandState, newState)
    },
    optional: () => {
      const newState = {
        ...state,
        optionality: { _tag: `optional` as const },
      }
      return create_(commandState, newState)
    },
    default: (tag: string, value: Pam.Value) => {
      const newState = {
        ...state,
        optionality: { _tag: `default` as const, tag, value },
      }
      return create_(commandState, newState)
    },
  })

  return builder
}

export { Builder as BuilderExclusive }
