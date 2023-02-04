import { invertTable } from '../../helpers.js'
import { Text } from '../Text/index.js'
export type { BlockBuilder, RootBuilder, TableBuilder } from './chain.js'
export { createRootBuilder as Tex } from './chain.js'

interface RenderContext {
  maxWidth: number
}

interface Shape {
  intrinsicWidth: number
  desiredWidth: number | null
}

export abstract class Node {
  abstract render(context: RenderContext): { shape: Shape; value: string }
  // abstract setParameters(parameters: object): void
}

export class Leaf extends Node {
  value: string
  parameters: object
  constructor(value: string) {
    super()
    this.value = value
    this.parameters = {}
  }
  // setParameters(parameters: object): void {
  //   this.parameters = parameters
  // }
  render(context: RenderContext) {
    const value = Text.lines(context.maxWidth, this.value).join(Text.chars.newline)
    const intrinsicWidth = Text.getLength(value)
    return {
      shape: {
        intrinsicWidth,
        desiredWidth: null,
      },
      value: value,
    }
  }
}

export interface TableParameters {
  separators?: {
    row?: string
    column?: string
  }
}

export class Table extends Node {
  rows: Block[][]
  headers: string[]
  parameters: TableParameters
  constructor(rows?: Block[][]) {
    super()
    this.rows = rows ?? []
    this.headers = []
    this.parameters = {}
  }
  setParameters(parameters: TableParameters) {
    this.parameters = parameters
  }
  render(context: RenderContext) {
    const separators = {
      column: this.parameters.separators?.column ?? ` ${Text.chars.pipe} `,
      row: (width: number) =>
        `${Text.chars.newline}${(this.parameters.separators?.row ?? `-`).repeat(width)}${Text.chars.newline}`,
    }
    const rows = this.rows.map((row) =>
      row.map((cell) => {
        return cell.render(context).value
      })
    )
    const rowsAndHeaders = this.headers.length > 0 ? [this.headers, ...rows] : rows
    // console.log({ rowsAndHeaders })
    const maxWidthOfEachColumn = invertTable(rowsAndHeaders).map((col) =>
      Math.max(...col.flatMap(Text.toLines).map(Text.getLength))
    )
    const rowsWithCellWidthsNormalized = rowsAndHeaders.map((row) => {
      const maxNumberOfLinesAmongColumns = Math.max(...row.map(Text.toLines).map((lines) => lines.length))
      // console.log(maxNumberOfLinesAmongColumns)
      const row_ = row.map((col) => {
        const numberOfLines = Text.toLines(col).length
        if (numberOfLines < maxNumberOfLinesAmongColumns) {
          return col + Text.chars.newline.repeat(maxNumberOfLinesAmongColumns - numberOfLines)
        }
        return col
      })
      const row__ = row_.map((col, i) =>
        Text.mapLines(col, (line) => Text.padWithin(`right`, maxWidthOfEachColumn[i] ?? 0, ` `, line))
      )
      return row__
    })
    // console.log({ rowsWithCellWidthsNormalized })
    const rowsWithCellsJoined = rowsWithCellWidthsNormalized.map((r) =>
      Text.joinColumns(r.map(Text.toLines), separators.column)
    )
    const width = Math.max(...rowsWithCellsJoined.flatMap(Text.toLines).map(Text.getLength))
    const value = rowsWithCellsJoined.join(separators.row(width))

    return {
      shape: {
        intrinsicWidth: 0,
        desiredWidth: 0,
      },
      value: value,
    }
  }
}

export interface BlockParameters {
  maxWidth?: number
  width?: `${number}%`
  border?: {
    top?: string
    left?: string
    bottom?: string
    right?: string
  }
  padding?: {
    top?: number
    left?: number
    bottom?: number
  }
}

export class Block extends Node {
  children: Node[]
  parameters: BlockParameters
  constructor(parameters: BlockParameters, node: Node)
  constructor(parameters: BlockParameters, nodes: Node[])
  constructor(parameters: BlockParameters, text: string)
  constructor(nodes: Node[])
  constructor(node: Node)
  constructor(text: string)
  constructor()
  constructor(...args: [] | [string | Node | Node[]] | [BlockParameters, string | Node | Node[]]) {
    super()
    const parameters = args.length === 1 || args.length === 0 ? {} : args[0]
    const children = args.length === 0 ? [] : args.length === 1 ? args[0] : args[1]

    this.parameters = parameters

    if (typeof children === `string`) {
      this.children = [new Leaf(children)]
    } else if (Array.isArray(children)) {
      this.children = children
    } else {
      this.children = [children]
    }
  }
  addChild(node: Node) {
    this.children.push(node)
  }
  setParameters(parameters: BlockParameters) {
    this.parameters = parameters
  }
  render(context: RenderContext) {
    const widthOwn =
      typeof this.parameters.width === `number`
        ? { type: `absolute` as const, value: this.parameters.width }
        : typeof this.parameters.width === `string`
        ? this.parameters.width.match(/(\d+)%/)
          ? { type: `percentage` as const, value: parseInt(this.parameters.width.match(/(\d+)%/)![1]!) / 100 }
          : null
        : null
    const widthOwnResolved = widthOwn
      ? widthOwn.type === `absolute`
        ? widthOwn.value
        : widthOwn.value * context.maxWidth
      : null
    const maxWidthOwn = this.parameters.maxWidth ?? Infinity
    const paddingLeftOwn = this.parameters.padding?.left ?? 0
    const maxWidthResolved =
      Math.min(widthOwnResolved ?? Infinity, maxWidthOwn, context.maxWidth) - paddingLeftOwn
    let intrinsicWidth = 0

    let renderings: string[] = []
    for (const child of this.children) {
      const rendered = child.render({ maxWidth: maxWidthResolved })
      intrinsicWidth = Math.max(intrinsicWidth, rendered.shape.intrinsicWidth)
      renderings.push(rendered.value)
    }

    const width = widthOwnResolved === null ? intrinsicWidth : maxWidthResolved
    renderings = renderings.map((_) => Text.span(`left`, width, _))

    const joined = renderings.join(Text.chars.newline)

    let value = joined

    value = this.parameters.padding?.top
      ? Text.chars.newline.repeat(this.parameters.padding.top) + value
      : value
    value = this.parameters.padding?.left
      ? Text.indentBlock(value, Text.chars.space.repeat(this.parameters.padding.left))
      : value
    value = this.parameters.padding?.bottom
      ? value + Text.chars.newline.repeat(this.parameters.padding.bottom)
      : value

    value = this.parameters.border?.top
      ? this.parameters.border.top.repeat(width) + Text.chars.newline + value
      : value
    value = this.parameters.border?.left
      ? Text.fromLines(Text.indentColumn(Text.toLines(value), this.parameters.border.left))
      : value
    value = this.parameters.border?.bottom
      ? value + Text.chars.newline + this.parameters.border.bottom.repeat(width)
      : value
    value = this.parameters.border?.right
      ? Text.fromLines(Text.toLines(value).map((_) => _ + this.parameters.border!.right!))
      : value

    return {
      shape: {
        intrinsicWidth,
        desiredWidth: 0,
      },
      value,
    }
  }
}
