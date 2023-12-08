import type { SetObjectProperty, UpdateObject } from '../../helpers.js'

export namespace PrivateData {
  export type Set<$Data, $Obj extends object> = SetObjectProperty<
    $Obj,
    PrivateDataSymbol,
    $Data
  >

  export type Remove<$Obj extends Obj> = Omit<$Obj, PrivateDataSymbol>

  export const set = <$PrivateData, $Obj extends object>(
    privateData: $PrivateData,
    object: $Obj,
  ): Set<$PrivateData, $Obj> => {
    return {
      [PrivateDataSymbol]: privateData,
      ...object,
    }
  }

  export type Get<$Obj extends Obj> = $Obj[PrivateDataSymbol]

  export const get = <$Obj extends Obj>(obj: $Obj): Get<$Obj> =>
    obj[PrivateDataSymbol]

  export type Obj<$Data extends object = object> = {
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
  > = PrivateData.Set<SetObjectProperty<PrivateData.Get<$Obj>, $P, $V>, $Obj>

  export type Update<
    $Obj extends PrivateData.Obj<any>,
    $ObjNew extends Partial<PrivateData.Get<$Obj>>,
  > = UpdateObject<PrivateData.Get<$Obj>, $ObjNew>

  const PrivateDataSymbol = Symbol(`PrivateData`)

  type PrivateDataSymbol = typeof PrivateDataSymbol
}
