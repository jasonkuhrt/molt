export interface String extends Refinements {
  _tag: 'TypeString'
}

interface Refinements {
  transformations?: {
    trim?: boolean
    toCase?: 'upper' | 'lower'
  }
  regex?: RegExp
  min?: number
  max?: number
  length?: number
  pattern?:
    | {
        type: 'email'
      }
    | {
        type: 'url'
      }
    | {
        type: 'uuid'
      }
    | {
        type: 'cuid'
      }
    | {
        type: 'cuid2'
      }
    | {
        type: 'ulid'
      }
    | {
        type: 'emoji'
      }
    | {
        type: 'ip'
        /**
         * If `null` then either IPv4 or IPv6 is allowed.
         */
        version: 4 | 6 | null
      }
    | {
        type: 'dateTime'
        offset: boolean
        precision: null | number
      }
  startsWith?: string
  endsWith?: string
  includes?: string
}

// eslint-disable-next-line
export const string = (refinements?: Refinements): String => {
  return { _tag: `TypeString`, ...refinements }
}
