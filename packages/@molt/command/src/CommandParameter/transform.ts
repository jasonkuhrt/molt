import type { Output } from './output.js'
import { Alge } from 'alge'

/**
 * Apply transformations specific in the parameter. For example strings can be trimmed.
 */
export const transform = <T>(spec: Output, value: T): T => {
  return (
    Alge.match(spec)
      .Basic((spec) => spec.type.transform?.(value) ?? value)
      // todo do we need this?
      .Exclusive((spec) => null as any)
      .done()
  )
}
