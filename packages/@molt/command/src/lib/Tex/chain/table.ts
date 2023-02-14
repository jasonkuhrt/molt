import type { TableParameters } from '../nodes.js'
import { Leaf } from '../nodes.js'
import { Block, Table } from '../nodes.js'
import type { BlockBuilder, BlockMethod, BlockMethodArgs } from './block.js'
import { resolveBlockMethodArgs } from './block.js'
import type { NodeImplementor } from './helpers.js'
import { toInternalBuilder } from './helpers.js'
import type { RootBuilder } from './root.js'

// prettier-ignore
export interface TableMethod<Chain> {
  (rows: Block[][])                                                      : Chain
  (builder: NodeImplementor<TableBuilder>)                               : Chain
  (parameters: TableParameters, builder: NodeImplementor<TableBuilder>)  : Chain
}

export type TableMethodArgs =
  | [Block[][]]
  | [TableParameters, NodeImplementor<TableBuilder>]
  | [NodeImplementor<TableBuilder>]

export const resolveTableMethodArgs = (
  args: TableMethodArgs
): { parameters: TableParameters | null; child: null | Table } => {
  const childrenInput = args.length === 1 ? args[0] : args[1]
  const parameters = args.length === 1 ? null : args[0]
  const child =
    typeof childrenInput === `function`
      ? toInternalBuilder(childrenInput(createTableBuilder()))?._.node ?? null
      : new Table(childrenInput)

  return { parameters, child }
}

export interface TableBuilder {
  set(parameters: TableParameters): TableBuilder
  row(...cells: (BlockBuilder | RootBuilder | Block | string | null)[]): TableBuilder
  rows(...rows: (null | (BlockBuilder | RootBuilder | Block | string | null)[])[]): TableBuilder
  headers(headers: (string | Block)[]): TableBuilder
  header: BlockMethod<TableBuilder>
}

export const createTableBuilder = (): TableBuilder => {
  const parentNode = new Table()
  const $: TableBuilder = {
    set: (parameters) => {
      parentNode.setParameters(parameters)
      return $
    },
    row: (...cells) => {
      const cellsNormalized = cells
        .filter((cell): cell is string | RootBuilder | BlockBuilder<null> | Block => cell !== null)
        .map((cell) =>
          typeof cell === `string`
            ? new Block(new Leaf(cell))
            : cell instanceof Block
            ? cell
            : toInternalBuilder(cell)._.node
        )
      if (cellsNormalized.length > 0) {
        parentNode.rows.push(cellsNormalized)
      }
      return $
    },
    rows: (...rows) => {
      const rowsNormalized = rows
        .filter((_): _ is (string | BlockBuilder<null> | Block | RootBuilder | null)[] => _ !== null)
        .map((cells) =>
          cells
            .filter((cell): cell is string | BlockBuilder | Block | RootBuilder => cell !== null)
            .map((cell) =>
              typeof cell === `string`
                ? new Block(new Leaf(cell))
                : cell instanceof Block
                ? cell
                : toInternalBuilder(cell)._.node
            )
        )

      if (rowsNormalized.length > 0) {
        parentNode.rows.push(...rowsNormalized)
      }
      return $
    },
    headers: (headers) => {
      parentNode.headers = headers.map((_) => (_ instanceof Block ? _ : new Block(new Leaf(_))))
      return $
    },
    header: (...args: BlockMethodArgs) => {
      const input = resolveBlockMethodArgs(args)
      if (input.child) {
        if (input.parameters) {
          input.child.setParameters(input.parameters)
        }
        parentNode.headers.push(input.child)
      }
      return $
    },
  }
  // Define Internal Methods
  toInternalBuilder($)._ = {
    node: parentNode,
  }
  return $
}
