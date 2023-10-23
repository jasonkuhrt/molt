import type { Boolean, Enumeration, Literal, Number, String } from './Scalars/index.js'

export type Scalar = Literal | Boolean | Enumeration | String | Number // eslint-disable-line

export * as Scalar from './Scalars/index.js'
