import { invertTable } from '../../helpers.js'
import { Text } from '../Text/index.js'

interface RenderContext {
  maxWidth?: undefined | number
  height?: undefined | number
  color?: undefined | ((text: string) => string)
  phase?: undefined | 'inner' | 'outer'
  index: {
    total: number
    isLast: boolean
    isFirst: boolean
    position: number
  }
}

interface Shape {
  intrinsicWidth: number
  intrinsicHeight: number
  desiredWidth: number | null
}

export abstract class Node {
  abstract render(context: RenderContext): { shape: Shape; value: string }
}

export class Leaf extends Node {
  value: string
  constructor(value: string) {
    super()
    this.value = value
  }
  render(context: RenderContext) {
    const lines = Text.lines(context.maxWidth ?? 1000, this.value)
    const value = lines.join(Text.chars.newline)
    const intrinsicWidth = Math.max(...lines.map(Text.getLength))
    const intrinsicHeight = lines.length
    const valueColored = context.color ? context.color(value) : value
    return {
      shape: {
        intrinsicWidth,
        intrinsicHeight,
        desiredWidth: null,
      },
      value: valueColored,
    }
  }
}

export interface ListParameters {
  bullet?: {
    graphic?: string | ((index: number) => string)
    align?: {
      horizontal?: 'left' | 'right'
    }
  }
}

export class List extends Node {
  items: Block[]
  parameters: ListParameters
  constructor(items?: (string | Block)[]) {
    const items_ = items?.map((_) => (typeof _ === `string` ? new Block(new Leaf(_)) : _)) ?? []
    super()
    this.items = items_
    this.parameters = {}
  }
  setParameters(parameters: ListParameters) {
    this.parameters = parameters
    return this
  }
  render(context: RenderContext) {
    const bullet = {
      graphic: this.parameters.bullet?.graphic ?? `*`,
      align: {
        horizontal: this.parameters.bullet?.align?.horizontal ?? `left`,
      },
    }
    const bullets = ` `
      .repeat(this.items.length)
      .split(` `)
      .map((_, index) => (typeof bullet.graphic === `function` ? bullet.graphic(index) : bullet.graphic))
    const gutterWidth = Math.max(...bullets.map(Text.getLength))
    const gutterWidthWithSpacing = gutterWidth + 1
    const context_ = {
      ...context,
      maxWidth: (context.maxWidth ?? 1000) - gutterWidthWithSpacing,
    }
    const items = this.items.map((item) => item.render(context_).value)
    const value = items
      .map((_, index) => {
        return Text.joinColumns(
          [[Text.minSpan(bullet.align.horizontal, gutterWidth, bullets[index]!)], Text.toLines(_)],
          ` `
        )
      })
      .join(Text.chars.newline)
    const lines = items.flatMap(Text.toLines)
    const intrinsicWidth = Math.max(...lines.map(Text.getLength))
    const intrinsicHeight = lines.length
    return {
      shape: {
        intrinsicWidth,
        intrinsicHeight,
        desiredWidth: null,
      },
      value: value,
    }
  }
}

export interface TableParameters {
  separators?: {
    row?: string | null
    column?: string
  }
}

export class Table extends Node {
  rows: Block[][]
  headers: Block[]
  parameters: TableParameters
  constructor(rows?: Block[][]) {
    super()
    this.rows = rows ?? []
    this.headers = []
    this.parameters = {}
  }
  setParameters(parameters: TableParameters) {
    this.parameters = parameters
    return this
  }
  render(context: RenderContext) {
    const separators = {
      column: this.parameters.separators?.column ?? ` ${Text.chars.pipe} `,
      row: (width: number) => {
        const separator =
          this.parameters.separators?.row === undefined ? `-` : this.parameters.separators?.row
        if (separator === null) {
          return Text.chars.newline
        }
        return `${Text.chars.newline}${separator.repeat(width)}${Text.chars.newline}`
      },
    }
    const rows = this.rows.map((row) => {
      const total = row.length
      const rowsInner = row.map((cell, index) => {
        const r1 = cell.render({
          phase: `inner`,
          color: context.color,
          maxWidth: context.maxWidth,
          height: context.height,
          index: {
            total,
            isFirst: index === 0,
            isLast: index === total - 1,
            position: index,
          },
        })
        return r1
      })
      const maxCellHeight = Math.max(...rowsInner.map((_) => _.shape.intrinsicHeight))
      const rowsOuter = row.map((cell, index) => {
        const r2 = cell.render({
          phase: `outer`,
          color: context.color,
          maxWidth: context.maxWidth,
          height: maxCellHeight,
          index: {
            total,
            isFirst: index === 0,
            isLast: index === total - 1,
            position: index,
          },
        })
        return r2
      })
      return rowsOuter.map((_) => _.value)
    })
    const headers = this.headers.map((cell) => cell.render(context).value)
    const rowsAndHeaders = this.headers.length > 0 ? [headers, ...rows] : rows
    const maxWidthOfEachColumn = invertTable(rowsAndHeaders).map((col) =>
      Math.max(...col.flatMap(Text.toLines).map(Text.getLength))
    )
    const rowsWithCellWidthsNormalized = rowsAndHeaders.map((row) => {
      const maxNumberOfLinesAmongColumns = Math.max(...row.map(Text.toLines).map((lines) => lines.length))
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
    const rowsWithCellsJoined = rowsWithCellWidthsNormalized.map((r) =>
      Text.joinColumns(r.map(Text.toLines), separators.column)
    )
    const width = Math.max(...rowsWithCellsJoined.flatMap(Text.toLines).map(Text.getLength))
    const value = rowsWithCellsJoined.join(separators.row(width))

    return {
      shape: {
        intrinsicWidth: 0,
        intrinsicHeight: 0,
        desiredWidth: 0,
      },
      value: value,
    }
  }
}

export interface BlockParameters {
  minWidth?: number
  maxWidth?: number
  width?: `${number}%`
  color?: (text: string) => string
  border?: {
    top?: string | ((columnNumber: number) => string)
    left?: string | ((lineNumber: number) => string)
    bottom?: string | ((columnNumber: number) => string)
    right?: string | ((lineNumber: number) => string)
  }
  padding?: {
    top?: number
    topBetween?: number
    left?: number
    bottom?: number
    bottomBetween?: number
    right?: number
  }
  margin?: {
    top?: number
    left?: number
    bottom?: number
    right?: number
  }
}

export class Block extends Node {
  children: Node[]
  parameters: BlockParameters
  renderings: {
    inner: {
      width: number
      height: number
      result: string
    } | null
    outer: {
      width: number
      height: number
      result: string
    } | null
  }
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
    this.renderings = {
      inner: null,
      outer: null,
    }
  }
  addChild(node: Node) {
    this.children.push(node)
    return this
  }
  setParameters(parameters: BlockParameters) {
    this.parameters = parameters
    return this
  }
  render(context: RenderContext) {
    if (context.phase === `inner` || !context.phase) {
      const widthOwn =
        typeof this.parameters.width === `number`
          ? { type: `absolute` as const, value: this.parameters.width }
          : typeof this.parameters.width === `string`
          ? this.parameters.width.match(/(\d+)%/)
            ? {
                type: `percentage` as const,
                value: parseInt(this.parameters.width.match(/(\d+)%/)![1]!) / 100,
              }
            : null
          : null
      const widthOwnResolved = widthOwn
        ? widthOwn.type === `absolute`
          ? widthOwn.value
          : widthOwn.value * (context.maxWidth ?? 1000)
        : null
      const maxWidthOwn = this.parameters.maxWidth ?? Infinity
      const paddingLeftOwn = this.parameters.padding?.left ?? 0
      const maxWidthResolved =
        Math.min(widthOwnResolved ?? Infinity, maxWidthOwn, context.maxWidth ?? 1000) - paddingLeftOwn
      let intrinsicWidth = 0

      let renderings: string[] = []
      let index = 0
      for (const child of this.children) {
        const rendered = child.render({
          maxWidth: maxWidthResolved,
          height: context.height,
          color: this.parameters.color,
          index: {
            total: this.children.length,
            isFirst: index === 0,
            isLast: index === this.children.length - 1,
            position: index,
          },
        })

        // TODO minWidth should be passed down to children?
        if (this.parameters.minWidth !== undefined) {
          rendered.value = Text.mapLines(rendered.value, (_) =>
            Text.minSpan(`left`, this.parameters.minWidth!, _)
          )
        }
        intrinsicWidth = Math.max(intrinsicWidth, rendered.shape.intrinsicWidth)
        renderings.push(rendered.value)
        index++
      }

      const width = widthOwnResolved === null ? intrinsicWidth : maxWidthResolved
      // each line must span the width of the box
      renderings = renderings.map((_) => Text.minSpan(`left`, width, _))

      const joined = renderings.join(Text.chars.newline)

      let value = joined

      value =
        this.parameters.padding?.topBetween && !context.index.isFirst
          ? Text.chars.newline.repeat(this.parameters.padding.topBetween) + value
          : value
      value = this.parameters.padding?.top
        ? Text.chars.newline.repeat(this.parameters.padding.top) + value
        : value
      value = this.parameters.padding?.left
        ? Text.indentBlock(value, Text.chars.space.repeat(this.parameters.padding.left))
        : value
      value = this.parameters.padding?.bottom
        ? value + Text.chars.newline.repeat(this.parameters.padding.bottom)
        : value
      value =
        this.parameters.padding?.bottomBetween && !context.index.isLast
          ? value + Text.chars.newline.repeat(this.parameters.padding.bottomBetween)
          : value
      value = this.parameters.padding?.right
        ? Text.fromLines(
            Text.toLines(value).map((_) => _ + Text.chars.space.repeat(this.parameters.padding!.right!))
          )
        : value

      const intrinsicHeight = Text.toLines(value).length

      this.renderings.inner = {
        result: value,
        width,
        height: intrinsicHeight,
      }

      if (context.phase) {
        return {
          shape: {
            intrinsicWidth,
            intrinsicHeight,
            desiredWidth: 0,
          },
          value,
        }
      }
    }

    if (context.phase === `outer` || !context.phase) {
      const { width } = this.renderings.inner!
      const height = context.height ?? this.renderings.inner!.height
      let value = this.renderings.inner!.result
      const lineIndexes = [...Array(height).keys()]
      const widthIndexes = [...Array(width).keys()]

      const borderTop = this.parameters.border?.top
        ? typeof this.parameters.border.top === `string`
          ? this.parameters.border.top.repeat(width)
          : widthIndexes.map(this.parameters.border.top).join(``)
        : null

      const borderBottom = this.parameters.border?.bottom
        ? typeof this.parameters.border?.bottom === `string`
          ? this.parameters.border.bottom.repeat(width)
          : widthIndexes.map(this.parameters.border.bottom).join(``)
        : null

      const lines = Text.toLines(value)
      const linesWithBorders = []
      for (const index of lineIndexes) {
        let line = lines[index] ?? ` `.repeat(width)

        if (this.parameters.border?.left) {
          const spec = this.parameters.border.left
          const symbol = typeof spec === `string` ? spec : spec(index)
          line = symbol + line
        }
        if (this.parameters.border?.right) {
          const spec = this.parameters.border.right
          const symbol = typeof spec === `string` ? spec : spec(index)
          line = line + symbol
        }
        linesWithBorders.push(line)
      }
      const linesRendered = [borderTop, linesWithBorders.join(Text.chars.newline), borderBottom]
        .filter(Boolean)
        .join(Text.chars.newline)

      value = linesRendered

      //todo
      // value = this.parameters.margin?.top
      //   ? Text.chars.newline.repeat(this.parameters.margin.top) + value
      //   : value
      // value = this.parameters.margin?.left
      //   ? Text.indentBlock(value, Text.chars.space.repeat(this.parameters.margin.left))
      //   : value
      // value = this.parameters.margin?.bottom
      //   ? value + Text.chars.newline.repeat(this.parameters.margin.bottom)
      //   : value
      // value = this.parameters.margin?.right
      //   ? Text.fromLines(
      //       Text.toLines(value).map((_) => _ + Text.chars.space.repeat(this.parameters.margin!.right!))
      //     )
      //   : value

      const color = this.parameters.color ?? ((text: string) => text)
      value = color(value)

      const { maxWidth: intrinsicWidth, height: intrinsicHeight } = Text.measure(value)

      this.renderings.outer = {
        result: value,
        width: intrinsicWidth,
        height: intrinsicHeight,
      }

      return {
        shape: {
          intrinsicWidth,
          intrinsicHeight,
          desiredWidth: 0,
        },
        value,
      }
    }

    throw new Error(`Invalid phase`)
  }
}
