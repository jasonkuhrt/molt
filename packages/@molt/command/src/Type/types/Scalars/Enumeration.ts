export interface Enumeration<$Members extends Member[] = Member[]> {
  _tag: 'TypeEnum'
  members: $Members
}
type Member = number | string

export const enumeration = <$Members extends Member[]>(members: $Members): Enumeration<$Members> => {
  return { _tag: `TypeEnum`, members }
}
