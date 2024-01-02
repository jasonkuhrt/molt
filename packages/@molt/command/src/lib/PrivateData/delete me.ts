// import type { Simplify } from 'type-fest'
// import type {
//   Path,
//   SetObjectProperty,
//   ReplaceObjectProperties,
// } from '../../helpers.js'

// export namespace PrivateData {
//   type Args = [...unknown[]]
//   export type HostTarget = object
//   export type Data = Record<string, Values.Value>
//   export type Host<$Data extends Data = Data> = {
//     [PrivateSymbol]: $Data
//   }

//   export namespace Values {
//     export type ExcludeUnsetSymbol<$Value extends unknown> = Exclude<
//       $Value,
//       UnsetSymbol
//     >
//     export const unsetSymbol = Symbol(`Unset`)
//     export type UnsetSymbol = typeof unsetSymbol
//     export type UpdateSignature<$Return extends unknown = unknown> =
//       | { args: Args; return: $Return }
//       | { args: Args }

//     const typeSymbol = Symbol(`Type`)
//     export type Type<$Type = unknown> = {
//       [typeSymbol]: 1
//       type: $Type
//       value: $Type
//     }

//     const valueSymbol = Symbol(`Value`)

//     export type Atomic<
//       $Type extends unknown = unknown,
//       $ValueDefault extends $Type | UnsetSymbol = UnsetSymbol | $Type,
//       $UpdateSignature extends UnsetSymbol | UpdateSignature<$Type> =
//         | UnsetSymbol
//         | UpdateSignature<$Type>,
//       $Value extends $Type | UnsetSymbol = UnsetSymbol | $Type,
//     > = {
//       [valueSymbol]: 1
//       type: $Type
//       updateSignature: $UpdateSignature
//       valueDefault: $ValueDefault
//       // value: UnsetSymbol extends $ValueDefault ? $Value : $ValueDefault
//       value: $Value
//     }

//     export type ValueString = Atomic<string>
//     export type ValueBoolean = Atomic<boolean>
//     export type ValueNumber = Atomic<number>

//     // -- index
//     // export type IndexUpdateSignature =
//     //   | { key: string; args: Args }
//     //   | { key: string; args: Args; return: unknown }

//     // const indexSymbol = Symbol(`Index`)

//     // export type Index<
//     //   $Type extends unknown = unknown,
//     //   // $ValueDefault extends $Type | UnsetSymbol = UnsetSymbol | $Type,
//     //   // $UpdateSignature extends UnsetSymbol | UpdateSignature =
//     //   //   | UnsetSymbol
//     //   //   | UpdateSignature,
//     // > = {
//     //   [indexSymbol]: 1
//     //   type: Record<string, $Type>
//     //   // updateSignature: $UpdateSignature
//     //   // valueDefault: $ValueDefault
//     //   value: $Type | UnsetSymbol
//     // }

//     export type Value = Atomic | Type

//     // -- utilities

//     export type IsSet<$Value extends Value> = $Value extends Atomic
//       ? UnsetSymbol extends $Value['value']
//         ? false
//         : true
//       : true

//     export type Set<
//       $Value extends Atomic,
//       $ValueValue extends $Value['type'],
//     > = SetObjectProperty<$Value, 'value', $ValueValue>

//     // -- namespace

//     // const namespaceSymbol = Symbol(`Namespace`)

//     // export type Namespace<
//     //   $Values extends Record<string, Atomic> = Record<string, Atomic>,
//     // > = {
//     //   [namespaceSymbol]: 1
//     // } & $Values

//     // --- terms

//     export const valueUnset: Atomic<any> = {
//       [valueSymbol]: 1,
//       type: 0, // ignoreme, just for type level
//       updateSignature: unsetSymbol,
//       valueDefault: unsetSymbol,
//       value: unsetSymbol,
//     }
//   }

//   // export type GetInitial<$Data extends Data> = {
//   //   [K in keyof $Data & string]: $Data[K] extends Values.Atomic
//   //     ? GetInitialFromValue<$Data[K]>
//   //     : // : $Data[K] extends Values.Namespace
//   //       // ? GetInitialFromNamespace<$Data[K]>
//   //       $Data[K]
//   // }
//   type GetInitialFromValue<$Value extends Values.Atomic> =
//     Values.UnsetSymbol extends $Value['valueDefault']
//       ? $Value['value']
//       : $Value['valueDefault']
//   // type GetInitialFromNamespace<$Namespace extends Values.Namespace> = {
//   //   [K in keyof $Namespace & string]: $Namespace[K] extends Values.Atomic
//   //     ? GetInitialFromValue<$Namespace[K]>
//   //     : $Namespace[K] extends Values.Namespace
//   //     ? GetInitialFromNamespace<$Namespace[K]>
//   //     : never
//   // }

//   export type SetupHost<$Data, $Obj extends HostTarget> = SetObjectProperty<
//     $Obj,
//     PrivateDataSymbol,
//     $Data
//   >

//   export type PublicType<$Host extends Host> = Omit<$Host, PrivateDataSymbol>

//   export type Unset<$Obj extends Host> = Omit<$Obj, PrivateDataSymbol>

//   export const set = <$PrivateData, $Obj extends object>(
//     privateData: $PrivateData,
//     object: $Obj,
//   ): SetupHost<$PrivateData, $Obj> => {
//     return {
//       [PrivateSymbol]: privateData,
//       ...object,
//     }
//   }

//   export type Get<$Host extends Host> = $Host[PrivateDataSymbol]

//   export const get = <$Host extends Host>(obj: $Host): Simplify<Get<$Host>> =>
//     obj[PrivateSymbol] as any

//   export type MarkPropertyAsSet<
//     $Data extends Data,
//     $Path extends keyof $Data & string,
//   > = Path.Get<$Path, $Data> extends Values.Value
//     ? SetObjectProperty<
//         $Data,
//         $Path,
//         SetObjectProperty<
//           Path.Get<$Path, $Data>,
//           'value',
//           Path.Get<$Path, $Data>['type']
//         >
//       >
//     : never

//   export type UpdateProperty<
//     $Obj extends PrivateData.Host<any>,
//     $P extends keyof PrivateData.Get<$Obj>,
//     $V extends PrivateData.Get<$Obj>[$P],
//   > = SetObjectProperty<PrivateData.Get<$Obj>, $P, $V>

//   export type HostUpdateProperty<
//     $Obj extends PrivateData.Host<any>,
//     $P extends keyof PrivateData.Get<$Obj>,
//     $V extends PrivateData.Get<$Obj>[$P],
//   > = PrivateData.SetupHost<
//     SetObjectProperty<PrivateData.Get<$Obj>, $P, $V>,
//     $Obj
//   >

//   export type Update<
//     $Obj extends PrivateData.Host<any>,
//     $ObjNew extends Partial<PrivateData.Get<$Obj>>,
//   > = ReplaceObjectProperties<PrivateData.Get<$Obj>, $ObjNew>

//   const PrivateSymbol = Symbol(`PrivateData`)

//   type PrivateDataSymbol = typeof PrivateSymbol
// }
