import type { HKT, SetObjectProperty } from '../../helpers.js'
import type { Prompter } from '../../lib/Prompter/Prompter.js'
import type { OpeningArgs } from '../../OpeningArgs/index.js'
import { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import type { TypeBuilder } from '../TypeBuilder/types.js'
import type { RemoveIndex } from '../../helpers.js'
import type { Name as MoltName } from '@molt/name'
import type {
  ParameterBuilderDef,
  ParameterBuilderFn,
  ParameterBuilderInfer,
} from '../ParameterBuilder/chain.js'
import type { Simplify } from 'type-fest'

export namespace State {
  export type ParameterBuildersRecordBuilderMinimumState =
    BuilderKit.WithMinState<
      ParameterBuilderFn,
      ParameterBuilderDef['state'],
      {
        typeBuilder: TypeBuilder
      }
    >

  // TODO handle inferring exclusive parameters
  export type ToArgs<$State extends Builder['state']> =
    $State['data']['isPromptEnabled']['value'] extends true
      ? Promise<ToArgs_<$State>>
      : ToArgs_<$State>

  type ToArgs_<$State extends Builder['state']> = Simplify<{
    [$Name in keyof RemoveIndex<$State['data']['parameterBuilders']['value']> &
      string as MoltName.Data.GetCanonicalNameOrErrorFromParseResult<
      MoltName.Parse<$Name>
      // todo (leads to unknown right now)
    >]: ParameterBuilderInfer<
      $State['data']['parameterBuilders']['value'][$Name]
    >
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

interface Builder {
  chain: ChainFn
  constructor: null
  state: {
    name: 'command'
    resolve: null
    data: {
      description: BuilderKit.State.Values.ValueString
      parameterBuilders: BuilderKit.State.Values.Atom<
        Record<string, State.ParameterBuildersRecordBuilderMinimumState>,
        BuilderKit.State.Values.Unset,
        BuilderKit.State.Values.Unset,
        Record<string, State.ParameterBuildersRecordBuilderMinimumState>
      >
      isPromptEnabled: BuilderKit.State.Values.Atom<boolean, false>
    }
  }
}

// export interface ParameterConfiguration<
//   $State extends BuilderCommandState.Base = BuilderCommandState.Initial,
// > {
//   type: $State['Type']
//   prompt?: Prompt<HKT.Call<$State['TypeMapper'], this['type']>>
// }

export type IsHasKey<Obj extends object, Key> = Key extends keyof Obj
  ? true
  : false

// export type IsPromptEnabledInParameterSettings<
//   P extends ParameterConfiguration<any>,
// > = IsHasKey<P, 'prompt'> extends false ? false : IsPromptEnabled<P['prompt']>

// export type IsPromptEnabledInCommandSettings<P extends Settings.Input<any>> =
//   IsHasKey<P, 'prompt'> extends false ? false : IsPromptEnabled<P['prompt']>

// export type IsPromptEnabled<P extends Prompt<any> | undefined> =
//   P extends undefined
//     ? false
//     : P extends false
//     ? false
//     : P extends true
//     ? true
//     : P extends null
//     ? false
//     : Exclude<P, undefined | boolean | null>['enabled'] extends false
//     ? false
//     : true

interface ChainFn extends HKT.Fn {
  // @ts-expect-error ignoreme
  return: Chain<this['params']>
}

type Chain<$State extends Builder['state'] = Builder['state']> =
  BuilderKit.State.Setup<
    $State,
    {
      description: BuilderKit.UpdaterAtom<$State, 'description', ChainFn>
      parameters<
        $ParameterBuilders extends Builder['state']['data']['parameterBuilders']['type'],
      >(
        parameters: $ParameterBuilders,
      ): BuilderKit.SetPropertyValue<
        ChainFn,
        $State,
        'parameterBuilders',
        $State['data']['parameterBuilders']['value'] & $ParameterBuilders
      >
      parameter<
        $ParameterBuilder extends BuilderKit.WithMinState<
          ChainFn,
          ParameterBuilderDef['state'],
          {
            name: string
            typeBuilder: TypeBuilder
          }
        >,
      >(
        builder: $ParameterBuilder,
      ): BuilderKit.SetPropertyValue<
        ChainFn,
        $State,
        'parameterBuilders',
        SetObjectProperty<
          $State['data']['parameterBuilders']['value'],
          BuilderKit.State.Get<$ParameterBuilder>['data']['name']['value'],
          $ParameterBuilder
        >
      >

      // use<$Extension extends SomeExtension>(
      //   extension: $Extension,
      // ): Builder<{
      //   IsPromptEnabled: $State['IsPromptEnabled']
      //   Parameters: $State['Parameters']
      //   ParametersExclusive: $State['ParametersExclusive']
      //   Type: $Extension['types']['type']
      //   TypeMapper: $Extension['types']['typeMapper']
      // }>

      // parameter<
      //   $Builder extends BuilderCommandState.ParameterBuilderWithAtLeastNameAndType,
      // >(
      //   this: void,
      //   builder: $Builder,
      // ): Builder<BuilderCommandState.AddParameterBuilder<$State, $Builder>>
      // parameter<
      //   $Builder extends BuilderCommandState.ParameterBuilderWithAtLeastType,
      //   $NameExpression extends string,
      // >(
      //   this: void,
      //   name: BuilderCommandState.ValidateNameExpression<$State, $NameExpression>,
      //   builder: $Builder,
      // ): Builder<
      //   BuilderCommandState.AddParameterBuilder<
      //     $State,
      //     // @ts-expect-error TODO Why does the constraint of "BuilderCommandState.ParameterBuilderWithAtLeastType" not satisfy the type?
      //     ParameterBuilderUpdateStateProperty<$Builder, 'name', $NameExpression>
      //   >
      // >
      // // TODO TypeBuilder
      // parameter<$NameExpression extends string, $TypeBuilder extends TypeBuilder>(
      //   this: void,
      //   name: BuilderCommandState.ValidateNameExpression<$State, $NameExpression>,
      //   type: $TypeBuilder,
      // ): Builder<
      //   BuilderCommandState.AddParameterBuilder<
      //     $State,
      //     // @ts-expect-error TODO Why does this not work?
      //     ParameterBuilderUpdateState<
      //       ParameterBuilder,
      //       { name: $NameExpression; typeBuilder: $TypeBuilder }
      //     >
      //   >
      // >
      // parametersExclusive<Label extends string, $Builder extends Builder<$State>>(
      //   this: void,
      //   label: Label,
      //   ExclusiveBuilderBlock: (
      //     builder: BuilderExclusiveInitial<$State, Label>,
      //   ) => $Builder,
      // ): Builder<PrivateData.Get<$Builder>['commandBuilderState']>
      // settings<S extends Settings.Input<$State>>(
      //   this: void,
      //   newSettings: S,
      // ): Builder<
      //   Pipe<
      //     $State,
      //     [
      //       Objects.Update<
      //         'IsPromptEnabled',
      //         Objects.Assign<
      //           $State['IsPromptEnabled'] extends true
      //             ? true
      //             : IsPromptEnabledInCommandSettings<S>
      //         >
      //       >,
      //     ]
      //   >
      // >
      parse(this: void, inputs?: RawArgInputs): State.ToArgs<$State>
    }
  >

export type RawArgInputs = {
  line?: OpeningArgs.Line.RawInputs
  environment?: OpeningArgs.Environment.RawInputs
  tty?: Prompter
}

export type SomeArgsNormalized = Record<string, unknown>

export const create = BuilderKit.createBuilder<Builder>()({
  initialData: {
    parameterBuilders: {},
    description: BuilderKit.State.Values.unset,
    isPromptEnabled: false,
  },
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
      // use: (extension) => {
      //   const newState = {
      //     ...state,
      //     typeMapper: extension.typeMapper,
      //   }
      //   return create_(newState) as any
      // },
      // settings: (newSettings) => {
      //   const newState = {
      //     ...state,
      //     newSettingsBuffer: [...state.newSettingsBuffer, newSettings],
      //   }
      //   return create_(newState) as any
      // },
      // parameter: (nameExpression, typeOrConfiguration) => {
      //   const configuration =
      //     `type` in typeOrConfiguration
      //       ? typeOrConfiguration
      //       : { type: typeOrConfiguration }
      //   const prompt = configuration.prompt ?? null
      //   const type = state.typeMapper(configuration.type)
      //   const parameter = {
      //     _tag: `Basic`,
      //     type,
      //     nameExpression,
      //     prompt: prompt as any, // eslint-disable-line
      //   } satisfies ParameterBasicInput
      //   const newState = {
      //     ...state,
      //     parameterInputs: {
      //       ...state.parameterInputs,
      //       [nameExpression]: parameter,
      //     },
      //   }
      //   return create_(newState) as any
      // },
      // parametersExclusive: (label, builderBlock) => {
      //   const exclusiveBuilderState = PrivateData.get(
      //     builderBlock(ExclusiveBuilder.create(label, state)),
      //   ) // eslint-disable-line
      //   const newState = {
      //     ...state,
      //     parameterInputs: {
      //       ...state.parameterInputs,
      //       [label]: exclusiveBuilderState, // eslint-disable-line
      //     },
      //   }
      //   return create_(newState) as any
      // },
      // parse: (argInputs) => {
      //   const argInputsEnvironment = argInputs?.environment
      //     ? lowerCaseObjectKeys(argInputs.environment)
      //     : getLowerCaseEnvironment()
      //   state.settings = {
      //     ...Settings.getDefaults(argInputsEnvironment),
      //   }
      //   state.newSettingsBuffer.forEach((newSettings) =>
      //     Settings.change(state.settings!, newSettings, argInputsEnvironment),
      //   )
      //   state.settings.typeMapper = state.typeMapper
      //   return parse(state.settings, state.parameterInputs, argInputs)
      // },
    }
  },
})

export { Chain as CommandBuilder }
