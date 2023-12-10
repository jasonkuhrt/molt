import type { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import type { PrivateData } from '../../lib/PrivateData/PrivateData.js'
import type {
  ParameterBuilderFn,
  ParameterBuilderInfer,
  ParameterBuilderState,
} from '../ParameterBuilder/chain.js'
import type { TypeBuilder } from '../TypeBuilder/types.js'
import type { Values } from '../../helpers.js'

export namespace State {
  export type Base = {
    description: PrivateData.Values.ValueString
    parameterBuilders: PrivateData.Values.Atomic<
      Record<string, ParameterBuildersRecordBuilderMinimumState>,
      PrivateData.Values.UnsetSymbol,
      PrivateData.Values.UnsetSymbol,
      Record<string, ParameterBuildersRecordBuilderMinimumState>
    >
    // isPromptEnabled: PrivateData.Values.Atomic<boolean, false>
  }

  export type Initial = Base

  export type ParameterBuildersRecordBuilderMinimumState =
    BuilderKit.WithMinState<
      ParameterBuilderFn,
      ParameterBuilderState.Base,
      {
        typeBuilder: TypeBuilder
      }
    >

  // export type ToArgs<$State extends Base> = $State
  export type ToArgs<$State extends Base> =
    $State['isPromptEnabled']['value'] extends true
      ? Promise<ToArgs_<$State>>
      : ToArgs_<$State>

  // type ToArgs_<$State extends Base> = $State
  type ToArgs_<$State extends Base> = Values<{
    [Name in keyof $State['parameterBuilders']['value']]: ParameterBuilderInfer<
      $State['parameterBuilders']['value'][Name]
    >
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
