import { produce } from 'immer'
import type { HKT, SetObjectProperty } from '../../helpers.js'
import { PrivateData } from '../PrivateData/PrivateData.js'
import type { Simplify } from 'type-fest'
import type { HKT } from 'effect'

export namespace BuilderKit {
  export type Builder = PrivateData.Host

  export type BuilderFn = HKT.Fn<unknown, unknown>

  export type State = PrivateData.Data

  export type UpdaterAtomic<
    $State extends State,
    $Path extends State.Property.Paths<$State>,
    $BuilderFn extends BuilderFn,
    $Signature extends PrivateData.Values.UpdateSignature<
      $State[$Path]['type']
    > | null = null,
  > = $State[$Path] extends PrivateData.Values.Atomic
    ? $Signature extends PrivateData.Values.UpdateSignature
      ? UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          $State[$Path],
          $Signature
        >
      : $State[$Path]['updateSignature'] extends PrivateData.Values.UpdateSignature
      ? UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          $State[$Path],
          $State[$Path]['updateSignature']
        >
      : <$$Value extends $State[$Path]['type']>(
          value: $$Value,
        ) => HKT.Call<
          $BuilderFn,
          State.Property.Value.Set<$State, $Path, $$Value>
        >
    : never

  export type UpdaterFromSignature<
    $State extends State,
    $Path extends State.Property.Paths<$State>,
    $BuilderFn extends BuilderFn,
    $Value extends PrivateData.Values.Atomic,
    $Signature extends PrivateData.Values.UpdateSignature,
  > = $Signature['args'] extends []
    ? () => HKT.Call<
        $BuilderFn,
        State.Property.Value.Set<
          $State,
          $Path,
          'return' extends keyof $Signature
            ? $Signature['return'] extends HKT.Fn
              ? HKT.Call<$Signature['return'], []>
              : $Signature['return']
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
            ? $Signature['return'] extends HKT.Fn
              ? HKT.Call<$Signature['return'], $Args>
              : $Signature['return']
            : $Value['type']
        >
      >

  export type SetPropertyValue<
    $BuilderFn extends BuilderFn,
    $State extends State,
    $Path extends State.Property.Paths<$State>,
    $Value,
  > = HKT.Call<$BuilderFn, State.Property.Value.Set<$State, $Path, $Value>>

  export type WithMinState<
    $BuilderFn extends BuilderFn,
    $StateBase extends State,
    $PropertyValues extends object,
  > = HKT.Call<
    $BuilderFn,
    State.Property.Value.SetAll<$StateBase, $PropertyValues>
  >

  export namespace State {
    export type Setup<
      $State extends State,
      BuilderWithoutState extends object,
    > = PrivateData.SetupHost<$State, BuilderWithoutState>

    export type Get<$Builder extends PrivateData.Host> =
      PrivateData.Get<$Builder>

    export namespace Values {
      export type Unset = PrivateData.Values.UnsetSymbol
      export const unset: Unset = PrivateData.Values.unsetSymbol
      export type ExcludeUnset<$Value> =
        PrivateData.Values.ExcludeUnsetSymbol<$Value>
    }
    export type Initial<$State extends State> = Simplify<{
      [K in keyof $State & string as $State[K] extends PrivateData.Values.Type
        ? never
        : K]: $State[K] extends PrivateData.Values.Atomic
        ? Values.Unset extends $State[K]['valueDefault']
          ? $State[K]['value']
          : $State[K]['valueDefault']
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
        $State extends State,
        $Path extends Paths<$State>,
      > = $State[$Path] extends PrivateData.Values.Value ? $State[$Path] : never

      export namespace Value {
        export type Get<
          $State extends State,
          $Path extends Paths<$State>,
        > = $State[$Path] extends PrivateData.Values.Atomic
          ? $State[$Path]['value']
          : $State[$Path] extends PrivateData.Values.Type
          ? $State[$Path]['value']
          : never

        export type IsSet<
          $State extends State,
          $Path extends Paths<$State>,
        > = PrivateData.Values.IsSet<Property.Get<$State, $Path>>

        export type IsUnset<
          $State extends State,
          $Path extends Paths<$State>,
        > = IsSet<$State, $Path> extends true ? false : true

        export type Set<
          $State extends State,
          $Path extends Paths<$State>,
          $Value,
        > = SetObjectProperty<
          $State,
          $Path,
          SetObjectProperty<$State[$Path], 'value', $Value>
        >
        export type SetAll<
          $State extends State,
          $PropertyValues extends object,
        > = {
          [$Key in keyof $State]: $Key extends keyof $PropertyValues
            ? $State[$Key] extends PrivateData.Values.Atomic
              ? SetObjectProperty<$State[$Key], 'value', $PropertyValues[$Key]>
              : never
            : $State[$Key]
        }

        export type GetOrDefault<
          $State extends State,
          $Path extends Paths<$State>,
        > = $State[$Path] extends PrivateData.Values.Atomic
          ? Values.Unset extends $State[$Path]['value']
            ? Values.Unset extends $State[$Path]['valueDefault']
              ? $State[$Path]['value']
              : $State[$Path]['valueDefault']
            : $State[$Path]['value']
          : never

        export type GetSet<
          $State extends State,
          $Path extends Paths<$State>,
        > = PrivateData.Values.ExcludeUnsetSymbol<Get<$State, $Path>>
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
      export type Paths<$State extends State> = string
      // export type PropertyPaths<$State extends State> = PropertyPaths_<'', $State>
      // type PropertyPaths_<$Path extends string, $State extends State> = Values<{
      //   [K in keyof $State & string]: $State[K] extends PrivateData.Values.Atomic
      //     ? Path.Join<$Path, K>
      //     : $State[K] extends PrivateData.Values.Namespace
      //     ? PropertyPaths_<Path.Join<$Path, K>, $State[K]>
      //     : never
      // }>
    }

    export const get = PrivateData.get
  }
  // TODO how to collapse into a single function?
  export const createBuilder =
    <
      $State extends State,
      $BuilderFn extends BuilderFn,
      $ConstructorInput extends [...any[]], // TODO how to make 'any' here be 'unknown'?
    >() =>
    <
      _$Constructor extends (
        ...args: $ConstructorInput
      ) => Partial<BuilderKit.State.Initial<$State>>,
    >(
      params: {
        initialState: State.Initial<$State>
        implementation: (params: {
          state: State.Initial<$State>
          updater: Updater<$State>
        }) => object
        // constructor: _$Constructor
      } & ($ConstructorInput extends []
        ? {} // eslint-disable-line
        : {
            constructor: _$Constructor
            // constructor: (
            //   ...args: $ConstructorInput
            // ) => Partial<BuilderKit.State.Initial<$State>>
          }),
    ): $ConstructorInput extends []
      ? () => HKT.Call<$BuilderFn, $State>
      : (
          ...args: $ConstructorInput
        ) => HKT.Call<
          $BuilderFn,
          BuilderKit.State.Property.Value.SetAll<
            $State,
            ReturnType<_$Constructor>
          >
        > => {
      const create = () => {
        return create_(initialState)
      }

      const create_ = (state: $State) => {
        const updater = createUpdater({ state, createBuilder: create_ })
        const builder = PrivateData.set(
          state,
          params.implementation({ state, updater }),
        )
        return builder
      }

      return create
    }

  type Updater<$State extends State> = <$Args extends unknown[]>(
    pathExpression: State.Property.Paths<$State>,
    updater?: (...args: $Args) => unknown,
  ) => (...args: $Args) => object

  export const createUpdater =
    <
      $State extends State,
      $Builder extends (state: State.Initial<$State>) => unknown,
    >(params: {
      state: $State
      createBuilder: $Builder
    }) =>
    <$Args extends unknown[]>(
      pathExpression: State.PropertyPaths<$State>,
      updater?: (...args: $Args) => unknown,
    ) =>
    (...args: $Args) => {
      return params.createBuilder(
        produce(params.state, (draft) => {
          const path = pathExpression.split(`.`)
          const objectPath = path.slice(0, -1)
          const valuePath = path.slice(-1)
          const object = objectPath.reduce((acc, key) => {
            // @ts-expect-error fixme
            if (acc[key] === undefined) acc[key] = {}
            // @ts-expect-error fixme
            return acc[key]
          }, draft)
          // @ts-expect-error fixme
          object[valuePath] = updater?.(...args) ?? args[0]
        }) as any as State.Initial<$State>,
      )
    }
}
