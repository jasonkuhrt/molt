import type { Scalar } from './Scalar.js'

export interface Union<Members extends Member[] = Member[]> {
  _tag: 'TypeUnion'
  members: Members
}

export interface Member {
  type: Scalar | Union<Member[]>
  description: string | null
}

export const union = <$Members extends Member[]>(members: $Members): Union<$Members> => {
  return { _tag: `TypeUnion`, members }
}
