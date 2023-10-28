import type { Scalar } from './Scalar.js'

export interface Union<Members extends Member[] = Member[]> {
  _tag: 'TypeUnion'
  members: Members
  description: string | null
}

export interface Member {
  type: Scalar | Union<Member[]>
  description: string | null
}

export const union = <$Members extends Member[]>(
  members: $Members,
  description?: string,
): Union<$Members> => {
  return {
    _tag: `TypeUnion`,
    members,
    description: description ?? null,
  }
}
