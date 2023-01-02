import { Text } from './index.js'
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

export const column = (width: number, text: string): string[] => {
  const lines: string[] = text.split(`\n`)
  const linesFitted = lines.flatMap((text) => {
    const lines = []
    let textToConsume = text
    while (textToConsume.length > 0) {
      const result = visualStringTakeWords(textToConsume, width)
      const textLines = result.taken.replace(/\n$/, ``).split(newline)
      lines.push(...textLines)
      textToConsume = result.remaining
    }
    return lines
  })
  return linesFitted
}

export const chars = {
  arrowRight: `→`,
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

export const visualStringTakeWords = (string: string, size: number): { taken: string; remaining: string } => {
  const words = splitWords(string)
  let taken = ``

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // There are no words (empty string)
    if (words.length === 0) {
      break
    }
    const word = String(words[0])

    // single word is too long for asked take
    if (stringLength(word) > size) {
      // TODO hyphen the word?
      words.shift()
      taken += String(word)
      continue
    }

    // Cannot take any more, taking another word would exceed limit:
    if (stringLength(taken + ` ` + word) > size) {
      break
    }

    words.shift()
    taken += (taken.length ? ` ` : ``) + word
  }

  const remaining = joinWords(words)

  const result = {
    taken,
    remaining,
  }

  return result
}

const joinWords = (words: string[]): string => {
  return words.reduce((string, word, i) => {
    return i === 0 ? word : string + (string[string.length - 1] === Text.chars.newline ? `` : ` `) + word
  }, ``)
}

const splitWords = (string: string): string[] => {
  const words = []
  let currentWord = ``
  let currentWordReady = false
  for (const char of string.split(``)) {
    if (char === Text.chars.space && currentWordReady) {
      words.push(currentWord)
      // If the next word is on a new line then do not disregard the leading space
      currentWord = currentWord[currentWord.length - 1] === Text.chars.newline ? ` ` : ``
      currentWordReady = false
      continue
    }

    if (char !== Text.chars.space) {
      currentWordReady = true
    }

    currentWord += char
  }

  if (currentWord.length > 0) {
    words.push(currentWord)
  }
  return words
}
