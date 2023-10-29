import type { Type } from '../Type/helpers.js'

export interface Extension<
  $Namespace extends string,
  $Type extends Type<any>,
  $Builder extends (...args: any[]) => $Type,
> {
  namespace: $Namespace
  type: $Type
  builder: $Builder
}

export const createExtension = <
  $Namespace extends string,
  $Type extends Type<any>,
  $Builder extends (...args: any[]) => $Type,
  $Extension extends Extension<$Namespace, $Type, $Builder>,
>(extension: {
  namespace: $Namespace
  builder: $Builder
}): $Extension => extension as any as $Extension
