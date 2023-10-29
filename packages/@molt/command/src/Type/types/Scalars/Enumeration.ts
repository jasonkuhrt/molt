export interface Enumeration<$Members extends Member[] = Member[]> {
  _tag: 'TypeEnum'
  members: $Members
  description: string | null
}
type Member = number | string

export const enumeration = <$Members extends Member[]>(
  members: $Members,
  description?: string,
): Enumeration<$Members> => {
  return {
    _tag: `TypeEnum`,
    members,
    description: description ?? null,
  }
}
