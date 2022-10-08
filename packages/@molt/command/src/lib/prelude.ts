export type Index<T> = Record<string, T>

import { inspect } from 'node:util'

export const dump = (...args: unknown[]) =>
  console.log(...args.map((arg) => inspect(arg, { depth: Infinity, colors: true })))

export const partition = <Item>(list: Item[], partitioner: (item: Item) => boolean): [Item[], Item[]] => {
  const left: Item[] = []
  const right: Item[] = []
  for (const item of list) {
    if (partitioner(item)) {
      right.push(item)
    } else {
      left.push(item)
    }
  }
  return [left, right]
}

export const keyBy = <Item extends object, Key extends keyof Item>(
  items: Item[],
  key: Key
): Item[Key] extends string ? Record<Item[Key], Item> : Record<string, never> => {
  const result: Record<string, Item> = {}

  for (const item of items) {
    const keyValue = item[key]
    if (typeof keyValue !== `string`) {
      throw Error(`Invalid key type: ${typeof item[key]}`)
    }
    result[keyValue] = item
  }

  // eslint-disable-next-line
  return result as any
}
