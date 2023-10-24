export const partition = <T>(list: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  const pass: T[] = []
  const fail: T[] = []

  for (const item of list) {
    if (predicate(item)) {
      pass.push(item)
    } else {
      fail.push(item)
    }
  }

  return [pass, fail]
}

export const stripeDashPrefix = (string: string): string => {
  return string.replace(/^-+/, ``)
}
