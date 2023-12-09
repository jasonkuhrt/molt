import type { SetObjectProperty, UpdateObject } from '../../helpers.js'

export namespace PrivateData {
  type Args = [...unknown[]]
  type Host = object
  export type Data = object
  // type Data2 =

  export namespace Values {
    const unsetSymbol = Symbol(`Unset`)
    export type UnsetSymbol = typeof unsetSymbol
    export type UpdateSignature =
      | { args: Args; return: unknown }
      | { args: Args }

    const valueSymbol = Symbol(`Value`)

    export type Define<
      $Type extends unknown,
      $ValueDefault extends $Type | UnsetSymbol = UnsetSymbol,
      $UpdateSignature extends UnsetSymbol | UpdateSignature = UnsetSymbol,
    > = {
      [valueSymbol]: 1
      type: $Type
      updateSignature: $UpdateSignature
      valueDefault: $ValueDefault
      value: $Type | UnsetSymbol
    }

    export type DefineSimple<$Value extends unknown = unknown> = Define<$Value>
    export type DefineSimpleString = Define<string>
    export type DefineSimpleBoolean = Define<boolean>
    export type DefineSimpleNumber = Define<number>

    export type Value = Define<unknown, unknown, UnsetSymbol | UpdateSignature>

    // -- utilities

    export type IsSet<$Value extends Value> =
      UnsetSymbol extends $Value['value'] ? false : true

    export type Set<
      $Value extends Value,
      $ValueValue extends $Value['type'],
    > = SetObjectProperty<$Value, 'value', $ValueValue>

    // -- namespace

    const namespaceSymbol = Symbol(`Namespace`)

    export type Namespace<
      $Values extends Record<string, Value> = Record<string, Value>,
    > = {
      [namespaceSymbol]: 1
    } & $Values

    // --- terms

    export const valueUnset: Define<any> = {
      [valueSymbol]: 1,
      type: 0, // ignoreme, just for type level
      updateSignature: unsetSymbol,
      valueDefault: unsetSymbol,
      value: unsetSymbol,
    }
  }

  export type GetInitial<$Data extends Data> = {
    [K in keyof $Data & string]: $Data[K] extends Values.Value
      ? GetInitialFromValue<$Data[K]>
      : $Data[K] extends Values.Namespace
      ? GetInitialFromNamespace<$Data[K]>
      : $Data[K]
  }
  type GetInitialFromValue<$Value extends Values.Value> =
    Values.UnsetSymbol extends $Value['valueDefault']
      ? $Value['value']
      : $Value['valueDefault']
  type GetInitialFromNamespace<$Namespace extends Values.Namespace> = {
    [K in keyof $Namespace & string]: $Namespace[K] extends Values.Value
      ? GetInitialFromValue<$Namespace[K]>
      : $Namespace[K] extends Values.Namespace
      ? GetInitialFromNamespace<$Namespace[K]>
      : never
  }

  export type SetupHost<$Data, $Obj extends Host> = SetObjectProperty<
    $Obj,
    PrivateDataSymbol,
    $Data
  >

  export type Unset<$Obj extends Obj> = Omit<$Obj, PrivateDataSymbol>

  export const set = <$PrivateData, $Obj extends object>(
    privateData: $PrivateData,
    object: $Obj,
  ): SetupHost<$PrivateData, $Obj> => {
    return {
      [PrivateDataSymbol]: privateData,
      ...object,
    }
  }

  export type Get<$Obj extends Obj> = $Obj[PrivateDataSymbol]

  export const get = <$Obj extends Obj>(obj: $Obj): Get<$Obj> =>
    obj[PrivateDataSymbol]

  export type Obj<$Data extends Data = Data> = {
    [_ in PrivateDataSymbol]: $Data
  }

  export type UpdateProperty<
    $Obj extends PrivateData.Obj<any>,
    $P extends keyof PrivateData.Get<$Obj>,
    $V extends PrivateData.Get<$Obj>[$P],
  > = SetObjectProperty<PrivateData.Get<$Obj>, $P, $V>

  export type HostUpdateProperty<
    $Obj extends PrivateData.Obj<any>,
    $P extends keyof PrivateData.Get<$Obj>,
    $V extends PrivateData.Get<$Obj>[$P],
  > = PrivateData.SetupHost<
    SetObjectProperty<PrivateData.Get<$Obj>, $P, $V>,
    $Obj
  >

  export type Update<
    $Obj extends PrivateData.Obj<any>,
    $ObjNew extends Partial<PrivateData.Get<$Obj>>,
  > = UpdateObject<PrivateData.Get<$Obj>, $ObjNew>

  const PrivateDataSymbol = Symbol(`PrivateData`)

  type PrivateDataSymbol = typeof PrivateDataSymbol
}
