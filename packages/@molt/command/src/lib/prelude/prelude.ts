export type ObjectSet<$Object extends object, Key extends keyof $Object, ValueType> = Omit<$Object, Key> & {
  [_ in Key]: ValueType
}
