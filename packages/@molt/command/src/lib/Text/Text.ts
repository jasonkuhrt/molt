import snakeCase from 'lodash.snakecase'
import stringLength from 'string-length'
import stripAnsi from 'strip-ansi'

export const borders = {
  vertical: `│`,
  horizontal: `─`,
  leftTop: `┌`,
  leftBottom: `└`,
  rightTop: `┐`,
  rightBottom: `┘`,
}

export type Line = string

export type Column = Line[]

export type Row = Column[]

export const line = (text = ``): string => `${text}\n`

export const space = ` `

export const newline = `\n`

export const span = (alignContent: 'left' | 'right', width: number, content: string): string => {
  const contentWidth = stripAnsi(content).length
  return pad(alignContent === `left` ? `right` : `left`, Math.max(0, width - contentWidth), space, content)
}

export const pad = (side: 'left' | 'right', size: number, char: string, text: string): string => {
  return side === `left` ? char.repeat(size) + text : text + char.repeat(size)
}

export const underline = (string: string): string => {
  return line(string) + chars.lineH.repeat(string.length)
}

export const joinListEnglish = (list: string[]): string => {
  if (list.length === 0) return ``
  if (list.length === 1) return list[0] as string
  if (list.length === 2) return `${list[0] as string} or ${list[1] as string}`
  return `${list.slice(0, list.length - 1).join(`, `)} or ${list[list.length - 1] as string}`
}

export const row = (
  columns: {
    lines: string[]
    width?: number | undefined
    separator?: string | undefined
  }[]
): string => {
  const columnsSized = columns.map((_) => {
    return {
      lines: _.lines,
      width: _.width ?? _.lines.reduce((widthSoFar, line) => Math.max(widthSoFar, line.length), 0),
      separator: _.separator ?? defaultColumnSeparator,
    }
  })
  const lineCount = Math.max(...columns.map((_) => _.lines.length))
  let currentLine = 0
  const lines = []
  while (currentLine < lineCount) {
    const line = columnsSized
      .map((col) => ({
        content: span(`left`, col.width, col.lines[currentLine] ?? ``),
        separator: col.separator,
      }))
      .reduce(
        (line, col, currentLine) => (currentLine === 0 ? col.content : line + col.separator + col.content),
        ``
      )
    lines.push(line)
    currentLine++
  }
  return lines.join(newline)
}

export const toEnvarNameCase = (name: string) => snakeCase(name).toUpperCase()

export const visualStringTake = (string: string, size: number): string => {
  let taken = string.slice(0, size)
  let i = 0
  while (stringLength(taken) < size) {
    if (taken.length === string.length) break
    i++
    taken = string.slice(0, size + i)
  }
  return taken
}

export const column = (width: number, text: string): string[] => {
  const lines = []
  let textToConsume = text
  while (textToConsume.length > 0) {
    const textConsumed = visualStringTake(textToConsume, width)
    const textLines = textConsumed.split(newline)
    if (textLines.length === 1) {
      // eslint-disable-next-line
      lines.push(textLines[0]!)
      textToConsume = textToConsume.slice(textConsumed.length)
    } else {
      // eslint-disable-next-line
      const lastTextLine = textLines.pop()!
      textToConsume = textToConsume.slice(textConsumed.length - lastTextLine.length)
      lines.push(...textLines)
    }
  }
  return lines
}

export const chars = {
  arrowR: `→`,
  lineH: `─`,
  lineHBold: `━`,
  x: `✕`,
  check: `✓`,
  newline,
  space,
  pipe: `|`,
}

export const indentBlock = (text: string, symbol = `  `): string => {
  return indentColumn(text.split(chars.newline), symbol).join(chars.newline)
}

export const indentColumn = (column: Column, symbol = `  `): Column => {
  return column.map((line) => symbol + line)
}

export const indentBlockWith = (text: string, indenter: (line: Line, index: number) => Line): string => {
  return indentColumnWith(text.split(chars.newline), indenter).join(chars.newline)
}

export const indentColumnWith = (column: Column, indenter: (line: Line, index: number) => Line): Column => {
  return column.map((line, index) => indenter(line, index) + line)
}

export const defaultColumnSeparator = chars.space.repeat(3)
