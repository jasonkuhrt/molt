import type { RemoveIndex } from '../../helpers.js'
import { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import type { PrivateData } from '../../lib/PrivateData/delete me.js'
import type { Name as MoltName } from '@molt/name'
import type {
  ParameterBuilderFn,
  ParameterBuilderInfer,
  ParameterBuilderState,
} from '../ParameterBuilder/chain.js'
import type { TypeBuilder } from '../TypeBuilder/types.js'
import type { Simplify } from 'type-fest'

export namespace State {
  export type Base = {
    description: PrivateData.Values.ValueString
    parameterBuilders: PrivateData.Values.Atomic<
      Record<string, ParameterBuildersRecordBuilderMinimumState>,
      PrivateData.Values.UnsetSymbol,
      PrivateData.Values.UnsetSymbol,
      Record<string, ParameterBuildersRecordBuilderMinimumState>
    >
    isPromptEnabled: PrivateData.Values.Atomic<boolean, false>
  }

  export type Initial = Base

  export const initial: BuilderKit.State.RuntimeData<Base> = {
    parameterBuilders: {},
    description: BuilderKit.State.Values.unset,
    isPromptEnabled: false,
  }

  export type ParameterBuildersRecordBuilderMinimumState =
    BuilderKit.WithMinState<
      ParameterBuilderFn,
      ParameterBuilderState.Base,
      {
        typeBuilder: TypeBuilder
      }
    >

  // TODO handle inferring exclusive parameters
  export type ToArgs<$State extends Base> =
    $State['isPromptEnabled']['value'] extends true
      ? Promise<ToArgs_<$State>>
      : ToArgs_<$State>

  type ToArgs_<$State extends Base> = Simplify<{
    [$Name in keyof RemoveIndex<$State['parameterBuilders']['value']> &
      string as MoltName.Data.GetCanonicalNameOrErrorFromParseResult<
      MoltName.Parse<$Name>
      // todo (leads to unknown right now)
    >]: ParameterBuilderInfer<$State['parameterBuilders']['value'][$Name]>
    // >]: $State['parameterBuilders']['value'][$Name]
  }>

  // }>
  // & {
  //   [Label in keyof $State['ParametersExclusive'] & string]:
  //     | Simplify<
  //         Values<{
  //           [Name in keyof $State['ParametersExclusive'][Label]['Parameters']]: {
  //             _tag: $State['ParametersExclusive'][Label]['Parameters'][Name]['NameParsed']['canonical']
  //             value: Type.Infer<
  //               $State['ParametersExclusive'][Label]['Parameters'][Name]['Type']
  //             >
  //           }
  //         }>
  //       >
  //     | ($State['ParametersExclusive'][Label]['Optional'] extends true
  //         ? undefined
  //         : never)
  // }
}
