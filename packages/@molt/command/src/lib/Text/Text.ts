import stripAnsi from 'strip-ansi'

export type Lines = string[]

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

export const columns = (
  columns: {
    lines: string[]
    width?: number | undefined
    separator?: string | undefined
  }[]
): string => {
  const columnsSized = columns.map((_) => {
    return {
      lines: _.lines,
      width: _.width ?? _.lines.reduce((width, line) => Math.max(width, line.length), 0),
      separator: _.separator ?? chars.space.repeat(3),
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

export const column = (width: number, text: string): string[] => {
  const lines = []
  let textToConsume = stripAnsi(text)
  while (textToConsume.length > 0) {
    lines.push(textToConsume.slice(0, width).trim())
    textToConsume = textToConsume.slice(width)
  }
  return lines
}

export const chars = {
  lineH: `─`,
  lineHBold: `━`,
  newline,
  space,
}

export const indent = (text: string, size = 2): string => {
  return indentLines(text.split(chars.newline), size).join(chars.newline)
}

export const indentLines = (lines: string[], size = 2): string[] => {
  return lines.map((line) => space.repeat(size) + line)
}
