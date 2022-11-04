export type Index<T> = Record<string, T>

import { inspect } from 'node:util'
import { T } from 'vitest/dist/global-732f9b14.js'

export const dump = (...args: unknown[]) =>
  console.log(...args.map((arg) => inspect(arg, { depth: Infinity, colors: true })))

type ExcludeWhere<T, U> = T extends U ? never : T
type IncludeWhere<T, U> = T extends U ? T : never

export const partitionByTag = <Item extends { _tag: string }>(
  list: Item[]
): { [k in Item['_tag']]?: IncludeWhere<Item, { _tag: k }>[] } => {
  const variants: Record<string, Item[]> = {}
  for (const item of list) {
    if (variants[item._tag] === undefined) variants[item._tag] = []
    variants[item._tag]!.push(item)
  }
  return variants as any
}

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

// prettier-ignore
export function keyBy<Item extends object, Key extends keyof Item>(items: Item[], keyer: (item:Item) => string): Record<string, Item>
// prettier-ignore
export function keyBy<Item extends object, Key extends keyof Item>(items: Item[], key: Key): Item[Key] extends string ? Record<Item[Key], Item> : Record<string, never>
// prettier-ignore
export function keyBy<Item extends object, Key extends keyof Item>(items: Item[], key: Key|((item:Item)=>string)): Item[Key] extends string ? Record<Item[Key], Item> : Record<string, never> {
  const result: Record<string, Item> = {}

  for (const item of items) {
    const keyValue = typeof key === 'function'? key(item) : item[key]
    if (typeof keyValue !== `string`) {
      const message = typeof key === 'function' ? `Invalid key type returned from keyer function: ${typeof keyValue}` : `Invalid key type: ${typeof keyValue}`
      throw Error(message)
    }
    result[keyValue] = item
  }

  // eslint-disable-next-line
  return result as any
}
