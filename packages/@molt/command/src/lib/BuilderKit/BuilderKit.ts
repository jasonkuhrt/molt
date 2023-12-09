import type { HKT, Path, SetObjectProperty } from '../../helpers.js'
import type { PrivateData } from '../PrivateData/PrivateData.js'

export namespace BuilderKit {
  type Args = [...unknown[]]

  export type State = PrivateData.Data

  export namespace State {
    export type Get<$Builder extends PrivateData.Obj> =
      PrivateData.Get<$Builder>
    export type Set<
      $State extends State,
      $Builder extends object,
    > = PrivateData.SetupHost<$State, $Builder>
    export type GetPropertyType<
      $State extends State,
      $Path extends string,
    > = PrivateData.Values.Value extends Path.Get<$Path, $State>
      ? AccessValue<$Path, $State>['type']
      : never
    export type GetPropertyValue<
      $State extends State,
      $Path extends string,
    > = Path.Get<$Path, $State> extends PrivateData.Values.Value
      ? Path.Get<$Path, $State>['value']
      : never
    export type GetProperty<
      $State extends State,
      $Path extends string,
    > = Path.Get<$Path, $State> extends PrivateData.Values.Value
      ? Path.Get<$Path, $State>
      : never
    export type IsPropertySet<
      $State extends State,
      $Path extends string,
    > = PrivateData.Values.IsSet<Path.Get<$Path, $State>>
    export type IsPropertyUnset<
      $State extends State,
      $Path extends string,
    > = IsPropertySet<$State, $Path> extends true ? false : true
  }

  export type UpdateStateProperty<
    $State extends PrivateData.Data,
    $Path extends string,
    $Value extends State.GetPropertyType<$State, $Path>,
    $BuilderFn extends HKT.Fn<$State, PrivateData.Obj<$State>>,
  > = HKT.Call<
    $BuilderFn,
    SetObjectProperty<
      $State,
      $Path,
      PrivateData.Values.Set<Path.Get<$Path, $State>, $Value>
    >
  >

  export type Updater<
    $State extends PrivateData.Data,
    $Path extends ListPaths<'', $State>,
    $BuilderFn extends HKT.Fn<$State, PrivateData.Obj<$State>>,
    $Signature extends PrivateData.Values.UpdateSignature | null = null,
  > = Path.Get<$Path, $State> extends PrivateData.Values.Value
    ? $Signature extends PrivateData.Values.UpdateSignature
      ? UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          Path.Get<$Path, $State>,
          $Signature
        >
      : PrivateData.Values.UnsetSymbol extends Path.Get<
          $Path,
          $State
        >['updateSignature']
      ? <$$Value extends Path.Get<$Path, $State>['type']>(
          value: $$Value,
        ) => UpdateStateProperty<$State, $Path, $$Value, $BuilderFn>
      : UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          Path.Get<$Path, $State>,
          Path.Get<$Path, $State>['updateSignature']
        >
    : never

  // ? <$Value extends State.GetPropertyType<$State, $Path>>(
  //     value?: $Value,
  //   ) => UpdateStateProperty<
  //     $State,
  //     $Path,
  //     unknown extends $Value
  //       ? Path.Get<$Path, $State>['default']
  //       : $Value extends undefined
  //       ? Path.Get<$Path, $State>['default']
  //       : $Value,
  //     $BuilderFn
  //   >
  // : State.GetPropertyType<$State, $Path> extends Args
  // ? <$Args extends State.GetPropertyType<$State, $Path>>(
  //     ...args: $Args
  //   ) => UpdateStateProperty<$State, $Path, $Args, $BuilderFn>
  // : <$Value extends State.GetPropertyType<$State, $Path>>(
  //     value: $Value,
  //   ) => UpdateStateProperty<$State, $Path, $Value, $BuilderFn>)
  // never
  export type UpdaterFromSignature<
    $State extends PrivateData.Data,
    $Path extends ListPaths<'', $State>,
    $BuilderFn extends HKT.Fn<$State, PrivateData.Obj<$State>>,
    $Value extends PrivateData.Values.Value,
    $Signature extends PrivateData.Values.UpdateSignature,
  > = $Signature['args'] extends []
    ? () => UpdateStateProperty<
        $State,
        $Path,
        'return' extends keyof $Signature
          ? $Signature['return'] extends HKT.Fn
            ? HKT.Call<$Signature['return'], $Args>
            : $Signature['return']
          : $Value['type'],
        $BuilderFn
      >
    : <$Args extends $Signature['args']>(
        ...args: $Args
      ) => UpdateStateProperty<
        $State,
        $Path,
        'return' extends keyof $Signature
          ? $Signature['return'] extends HKT.Fn
            ? HKT.Call<$Signature['return'], $Args>
            : $Signature['return']
          : $Value['type'],
        $BuilderFn
      >

  // export type AccessValue<
  //   $Path extends string,
  //   $Obj extends object,
  // > = ReadValue<Path.Get<$Path, $Obj>>

  // export type ReadValue<$Obj extends unknown> =
  //   $Obj extends PrivateData.Values.Value ? $Obj['value'] : never

  export type ListPaths<
    $Path extends string,
    $State extends PrivateData.Data,
  > = {
    [K in keyof $State &
      string]: $State[K] extends PrivateData.Values.DefineSimple
      ? Path.Join<$Path, K>
      : $State[K] extends PrivateData.Values.Namespace
      ? ListPaths<Path.Join<$Path, K>, $State[K]>
      : never
  }[keyof $State & string]
}
