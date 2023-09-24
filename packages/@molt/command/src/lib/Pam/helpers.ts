import type { Type } from './kinds.js'

// prettier-ignore
export type TypeToValueMapping<T extends Type> =
  T extends Type.Scalar.Boolean         ? boolean :
  T extends Type.Scalar.Number          ? number  :
  T extends Type.Scalar.String          ? string  :
  T extends Type.Scalar.Enumeration     ? string  :
  T extends Type.Union                  ? boolean | number | string :
                                          never
