/* eslint-disable */
import { produce } from 'immer'
import type { HKT, SetObjectProperty } from '../../helpers.js'
import type { Simplify } from 'type-fest'
import { State } from '../../builders/ParameterBuilder/state.js'
import { Builder } from '../Tex/index_.js'

export namespace BuilderKit {
  export type Fn<
    Params extends StateController,
    Return extends object,
  > = HKT.Fn<Params, Return>

  const PrivateSymbol = Symbol(`Private`)

  type PrivateSymbol = typeof PrivateSymbol

  export type StateController = {
    name: string
    resolve: unknown
    data: Data
  }

  export type Data = Record<string, State.Values.Value>

  export type Builder = {
    [PrivateSymbol]: StateController
  }

  export type PublicType<$Host extends Builder> = Omit<$Host, PrivateSymbol>

  export type StateRemove<$Builder extends Builder> = PublicType<$Builder>

  // prettier-ignore
  export type UpdaterAtom<
    $State extends StateController,
    $Path extends State.Property.Paths<$State['data']>,
    $BuilderFn extends HKT.Fn,
    $Signature extends State.Values.UpdateSignature<
      $State['data'][$Path]['type']
    > | null = null,
  > = $State['data'][$Path] extends State.Values.Atom
    ? $Signature extends State.Values.UpdateSignature
      ? UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          $State['data'][$Path],
          $Signature
        >
      : $State['data'][$Path]['updateSignature'] extends State.Values.UpdateSignature
      ? UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          $State['data'][$Path],
          $State['data'][$Path]['updateSignature']
        >
      : <$$Value extends $State['data'][$Path]['type']>(
          value: $$Value,
        ) => HKT.Call<
          $BuilderFn,
          State.Property.Value.Set<$State, $Path, $$Value>
        >
    : never

  export type UpdaterFromSignature<
    $State extends StateController,
    $Path extends State.Property.Paths<$State['data']>,
    $BuilderFn extends HKT.Fn,
    $Value extends State.Values.Atom,
    $Signature extends State.Values.UpdateSignature,
  > = $Signature['args'] extends []
    ? () => HKT.Call<
        $BuilderFn,
        State.Property.Value.Set<
          $State,
          $Path,
          'return' extends keyof $Signature
            ? HKT.CallOrReturn<$Signature['return'], []>
            : $Value['type']
        >
      >
    : <$Args extends $Signature['args']>(
        ...args: $Args
      ) => HKT.Call<
        $BuilderFn,
        State.Property.Value.Set<
          $State,
          $Path,
          'return' extends keyof $Signature
            ? HKT.CallOrReturn<$Signature['return'], $Args>
            : $Value['type']
        >
      >

  export type SetPropertyValue<
    $BuilderFn extends HKT.Fn,
    $State extends StateController,
    $Path extends State.Property.Paths<$State['data']>,
    $Value,
  > = HKT.Call<$BuilderFn, State.Property.Value.Set<$State, $Path, $Value>>

  export type SetPropertyValues<
    $BuilderFn extends HKT.Fn,
    $State extends StateController,
    $PropertyValues extends object,
  > = HKT.Call<$BuilderFn, State.Property.Value.SetAll<$State, $PropertyValues>>

  export type WithMinState<
    $BuilderFn extends HKT.Fn,
    $StateBase extends StateController,
    $PropertyValues extends object,
  > = HKT.Call<
    $BuilderFn,
    State.Property.Value.SetAll<$StateBase, $PropertyValues>
  >

  type ResolveController = () => unknown

  export type HostTarget = object

  // prettier-ignore
  export type SetupHost<$State extends StateController, $Obj extends HostTarget> =
    SetObjectProperty<$Obj, PrivateSymbol, $State>

  export namespace State {
    export type Setup<
      $State extends StateController,
      BuilderWithoutState extends object,
    > = SetupHost<$State, BuilderWithoutState>

    export type Get<$Builder extends Builder> = $Builder[PrivateSymbol]

    export namespace Values {
      type Args = [...unknown[]]
      export type ExcludeUnsetSymbol<$Value extends unknown> = Exclude<
        $Value,
        Unset
      >
      export const unsetSymbol = Symbol(`Unset`)
      export type Unset = typeof unsetSymbol
      export type UpdateSignature<$Return extends unknown = unknown> =
        | { args: Args; return: $Return }
        | { args: Args }

      const typeSymbol = Symbol(`Type`)
      export type Type<$Type = unknown> = {
        [typeSymbol]: 1
        type: $Type
        value: $Type
      }

      const valueSymbol = Symbol(`Value`)

      export type Atom<
        $Type extends unknown = unknown,
        $ValueDefault extends $Type | Unset = Unset | $Type,
        $UpdateSignature extends Unset | UpdateSignature<$Type> =
          | Unset
          | UpdateSignature<$Type>,
        $Value extends $Type | Unset = Unset | $Type,
      > = {
        [valueSymbol]: 1
        type: $Type
        updateSignature: $UpdateSignature
        valueDefault: $ValueDefault
        // value: UnsetSymbol extends $ValueDefault ? $Value : $ValueDefault
        value: $Value
      }

      export type ValueString = Atom<string>
      export type ValueBoolean = Atom<boolean>
      export type ValueNumber = Atom<number>

      // -- index
      // export type IndexUpdateSignature =
      //   | { key: string; args: Args }
      //   | { key: string; args: Args; return: unknown }

      // const indexSymbol = Symbol(`Index`)

      // export type Index<
      //   $Type extends unknown = unknown,
      //   // $ValueDefault extends $Type | UnsetSymbol = UnsetSymbol | $Type,
      //   // $UpdateSignature extends UnsetSymbol | UpdateSignature =
      //   //   | UnsetSymbol
      //   //   | UpdateSignature,
      // > = {
      //   [indexSymbol]: 1
      //   type: Record<string, $Type>
      //   // updateSignature: $UpdateSignature
      //   // valueDefault: $ValueDefault
      //   value: $Type | UnsetSymbol
      // }

      export type Value = Atom | Type

      // -- utilities

      export type IsSet<$Value extends Value> = $Value extends Atom
        ? Unset extends $Value['value']
          ? false
          : true
        : true

      export type Set<
        $Value extends Atom,
        $ValueValue extends $Value['type'],
      > = SetObjectProperty<$Value, 'value', $ValueValue>

      // -- namespace

      // const namespaceSymbol = Symbol(`Namespace`)

      // export type Namespace<
      //   $Values extends Record<string, Atomic> = Record<string, Atomic>,
      // > = {
      //   [namespaceSymbol]: 1
      // } & $Values

      // --- terms

      export const valueUnset: Atom<any> = {
        [valueSymbol]: 1,
        type: 0, // ignoreme, just for type level
        updateSignature: unsetSymbol,
        valueDefault: unsetSymbol,
        value: unsetSymbol,
      }

      export const unset: Unset = Values.unsetSymbol
      export type ExcludeUnset<$Value> = Values.ExcludeUnsetSymbol<$Value>
    }

    export type ToRuntime<$State extends StateController> = {
      name: $State['name']
      resolve: () => $State['resolve']
      data: RuntimeData_<$State['data']>
    }

    // prettier-ignore
    export type RuntimeData<$State extends StateController> =
      RuntimeData_<$State['data']>

    export type RuntimeData_<$Data extends Data> = Simplify<{
      readonly [K in keyof $Data & string as $Data[K] extends Values.Type
        ? never
        : K]: $Data[K] extends Values.Atom
        ? Values.Unset extends $Data[K]['valueDefault']
          ? $Data[K]['value']
          : $Data[K]['valueDefault']
        : // : $State[K] extends PrivateData.Values.Namespace
          // ? Initial<$State[K]>
          never
    }>

    // export type SetProperties<
    //   $State extends State,
    //   $PropertyValues extends object,
    // > = {
    //   [$Key in keyof $State]: $Key extends keyof $PropertyValues
    //     ? $State[$Key] extends PrivateData.Values.Atomic
    //       ? SetObjectProperty<$State[$Key], 'value', $PropertyValues[$Key]>
    //       : $State[$Key] extends PrivateData.Values.Namespace
    //       ? $PropertyValues[$Key] extends object
    //         ? SetProperties<$State[$Key], $PropertyValues[$Key]>
    //         : 'Error: Assigning non-object to namespace'
    //       : 'Error: unknown kind of private data'
    //     : $State[$Key]
    // }

    export namespace Property {
      // export type SetProperty<
      //   $State extends State,
      //   $Path extends PropertyPaths<$State>,
      //   $Value,
      // > = $Path extends `${infer $Key}.${infer $Rest}`
      //   ? $State[$Key] extends PrivateData.Values.Namespace
      //     ? SetObjectProperty<
      //         $State,
      //         $Key,
      //         SetProperty<$State[$Key], $Rest, $Value>
      //       >
      //     : never //`Error: More path on non-namespace: ${$Key}`
      //   : $Path extends `${infer $Key}`
      //   ? $State[$Key] extends PrivateData.Values.Atomic
      //     ? SetObjectProperty<
      //         $State,
      //         $Key,
      //         SetObjectProperty<$State[$Key], 'value', $Value>
      //       >
      //     : never
      //   : never //'Error: Non-atomic path on atomic'

      export type Get<
        $State extends StateController,
        $Path extends Paths<$State['data']>,
      > = $State['data'][$Path] extends Values.Value
        ? $State['data'][$Path]
        : never

      export namespace Value {
        export type Get<
          $State extends Data,
          $Path extends Paths<$State>,
        > = $State[$Path] extends Values.Atom
          ? $State[$Path]['value']
          : $State[$Path] extends Values.Type
          ? $State[$Path]['value']
          : never

        export type IsSet<
          $State extends StateController,
          $Path extends Paths<$State['data']>,
        > = Values.IsSet<Property.Get<$State, $Path>>

        export type IsUnset<
          $State extends StateController,
          $Path extends Paths<$State['data']>,
        > = IsSet<$State, $Path> extends true ? false : true

        export type Set<
          $State extends StateController,
          $Path extends Paths<$State['data']>,
          $Value,
        > = {
          name: $State['name']
          resolve: $State['resolve']
          data: SetObjectProperty<
            $State['data'],
            $Path,
            SetObjectProperty<$State['data'][$Path], 'value', $Value>
          >
        }

        // prettier-ignore
        export type SetAll<
          $State extends StateController,
          $PropertyValues extends object,
        > = {
          name: $State['name']
          resolve: $State['resolve']
          data: {
            [$Key in keyof $State['data'] & string]:
              $Key extends keyof $PropertyValues
                ? $State['data'][$Key] extends Values.Atom | Values.Type
                ? SetObjectProperty<$State['data'][$Key], 'value', $PropertyValues[$Key]>
                : 'Error: unknown kind of private data'
             : $State['data'][$Key]
          }
        }

        export type GetOrDefault<
          $State extends StateController,
          $Path extends Paths<$State['data']>,
        > = GetOrDefault_<$State['data'], $Path>

        export type GetOrDefault_<
          $State extends Data,
          $Path extends Paths<$State>,
        > = $State[$Path] extends Values.Atom
          ? Values.Unset extends $State[$Path]['value']
            ? Values.Unset extends $State[$Path]['valueDefault']
              ? $State[$Path]['value']
              : $State[$Path]['valueDefault']
            : $State[$Path]['value']
          : never

        export type GetSet<
          $State extends StateController,
          $Path extends Paths<$State['data']>,
        > = Values.ExcludeUnsetSymbol<Get<$State['data'], $Path>>
      }

      // export type GetProperty<
      //   $State extends State,
      //   $Path extends PropertyPaths<$State>,
      // > = $Path extends `${infer $Key}.${infer $Rest}`
      //   ? $State[$Key] extends PrivateData.Values.Namespace
      //     ? GetProperty<$State[$Key], $Rest>
      //     : never //`Error: More path on non-namespace: ${$Key}`
      //   : $Path extends `${infer $Key}`
      //   ? $State[$Key] extends PrivateData.Values.Atomic
      //     ? $State[$Key]
      //     : never
      //   : never //'Error: Non-atomic path on atomic'
      export type Paths<$State extends Data> = string
      // export type PropertyPaths<$State extends State> = PropertyPaths_<'', $State>
      // type PropertyPaths_<$Path extends string, $State extends State> = Values<{
      //   [K in keyof $State & string]: $State[K] extends PrivateData.Values.Atomic
      //     ? Path.Join<$Path, K>
      //     : $State[K] extends PrivateData.Values.Namespace
      //     ? PropertyPaths_<Path.Join<$Path, K>, $State[K]>
      //     : never
      // }>
    }

    // prettier-ignore
    export const get = <$Builder extends Builder>(builder: $Builder): Simplify<ToRuntime<Get<$Builder>>> =>
      builder[PrivateSymbol] as any

    export const set = <$State extends StateController, $Obj extends object>(
      state: $State,
      object: $Obj,
    ): SetupHost<$State, $Obj> => {
      return {
        [PrivateSymbol]: state,
        ...object,
      }
    }
  }

  export namespace Builder {
    export type ToStaticInterface<$Builder extends Builder> = ToStaticReturn<
      StateRemove<$Builder>
    >

    /**
     * Simplify a builder's methods to always return the same builder type.
     *
     * This type is useful in some generic coding situations where types need to be loosened.
     */
    export type ToStaticReturn<$Builder extends StateRemove<Builder>> = {
      [K in keyof $Builder]: $Builder[K] extends (...args: infer $Args) => any
        ? (...args: $Args) => ToStaticReturn<$Builder>
        : never
    }
  }

  // prettier-ignore
  type OptionalTypeFunction =
    | null
    | TypeFunction

  // prettier-ignore
  type TypeFunction =
    HKT.Fn&{paramsConstraint:[...unknown[]]}

  // prettier-ignore
  type GetTypeFunctionParameters<$TypeFunction extends OptionalTypeFunction> =
    $TypeFunction extends TypeFunction ? $TypeFunction['paramsConstraint'] : []

  // TODO how to make 'any' here be 'unknown'?
  // prettier-ignore
  // type CreateBuilder =  <$StateBase extends State, $BuilderFn extends BuilderFn, $ConstructorFn extends OptionalTypeFunction>() =>
  type CreateBuilder =  <$Def extends { state: { data: Data; resolve: unknown }; chain: HKT.Fn; constructor: OptionalTypeFunction }>() =>
                            <_$BuilderInternal extends Builder.ToStaticInterface<HKT.Call<$Def['chain'], $Def['state']>>, const _$Params extends {
                                name?: string
                                initialData: State.ToRuntime<$Def['state']>['data']
                                implementation: (params: {
                                  state: BuilderKit.State.ToRuntime<$Def['state']>['data']
                                  updater: Updater<$Def['state'], _$BuilderInternal>
                                  recurse: <$State extends $Def['state']>(state: State.RuntimeData<$State>) => _$BuilderInternal
                                }) => _$BuilderInternal
                              } & (
                                $Def['constructor'] extends TypeFunction
                                  ? { constructor: ( ...args: GetTypeFunctionParameters<$Def['constructor']>) => HKT.Call<$Def['constructor'], GetTypeFunctionParameters<$Def['constructor']>> }
                                  : { }
                              ) & (
                                $Def['state']['resolve'] extends null
                                  ? {}
                                  : { resolve: (data: State.ToRuntime<$Def['state']>['data']) => HKT.CallOrReturn<$Def['state']['resolve'], $Def['state']> }

                              )
                            >(params: _$Params) =>
                              $Def['constructor'] extends TypeFunction
                              ? <const $ConstructorArgs extends $Def['constructor']['paramsConstraint']>(...args: $ConstructorArgs) => HKT.Call<$Def['chain'], BuilderKit.State.Property.Value.SetAll<$Def['state'], HKT.Call<$Def['constructor'], $ConstructorArgs>>>
                              : () => HKT.Call<$Def['chain'], $Def['state']>

  export const defaults = {
    resolve: () => null,
  }
  export const createBuilder: CreateBuilder = () => {
    return (params: any) => {
      const construct = (...constructorArgs: any[]) => {
        const resolve = params.resolve ?? defaults.resolve
        const name = params.name ?? 'anonymous'
        const initialData = params.constructor
          ? {
              name,
              resolve,
              data: {
                ...params.initialData,
                ...params.constructor?.(...constructorArgs),
              },
            }
          : {
              name,
              resolve,
              data: params.initialData,
            }
        return reconstruct(initialData)
      }

      const reconstruct: any = (state: any) => {
        const updater: any = createUpdater({
          state,
          createBuilder: reconstruct,
        })
        const builder = State.set(
          state,
          params.implementation({ state, updater, recurse: reconstruct }),
        )
        return builder
      }

      return construct
    }
  }

  export type Updater<
    $State extends StateController,
    $Builder extends StateRemove<Builder>,
  > = <
    $PathExpression extends State.Property.Paths<$State['data']>,
    $Args extends [State.Property.Get<$State, $PathExpression>['type']],
  >(
    pathExpression: $PathExpression,
    updater?: (
      ...args: $Args
    ) => State.Property.Get<$State, $PathExpression>['type'],
  ) => (...args: $Args) => $Builder

  // prettier-ignore
  export const valueIsUnset = (value: unknown): value is BuilderKit.State.Values.Unset => {
    return value === BuilderKit.State.Values.unset
  }

  // prettier-ignore
  export const valueOrUndefined = <$Value>(value: $Value): BuilderKit.State.Values.ExcludeUnset<$Value> | undefined => {
    return value === BuilderKit.State.Values.unset ? undefined : value as any
  }

  export const assertValueSet = <$Value>(
    value: $Value,
  ): asserts value is BuilderKit.State.Values.ExcludeUnset<$Value> => {
    if (value === BuilderKit.State.Values.unset) {
      throw new Error(`Value is unset. Expected it to be set.`)
    }
  }

  export const createUpdater =
    <
      $State extends StateController,
      $Builder extends (state: State.ToRuntime<$State>) => unknown,
    >(params: {
      state: $State
      createBuilder: $Builder
    }) =>
    <$Args extends unknown[]>(
      pathExpression: State.Property.Paths<$State['data']>,
      updater?: (...args: $Args) => unknown,
    ) =>
    (...args: $Args) => {
      return params.createBuilder({
        resolve: params.state.resolve ?? defaults.resolve,
        data: produce(params.state.data, (draft) => {
          const path = pathExpression.split(`.`)
          const objectPath = path.slice(0, -1)
          const valuePath = path.slice(-1)
          const object = objectPath.reduce((acc, key) => {
            // @ts-expect-error fixme
            if (acc[key] === undefined) acc[key] = {}
            return acc[key] as any
          }, draft)
          // @ts-expect-error fixme
          object[valuePath] = updater?.(...args) ?? args[0]
        }) as any as State.RuntimeData<$State>,
      })
    }
}
