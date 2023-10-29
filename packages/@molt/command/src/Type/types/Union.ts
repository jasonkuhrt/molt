import type { Scalar } from './Scalar.js'

export interface Union<Members extends readonly Member[] = Member[]> {
  _tag: 'TypeUnion'
  members: Members
  description: string | null
}

export type Member = Scalar | Union<Member[]>

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
