import { Either } from 'effect'
import camelCase from 'lodash.camelcase'
import { negateNamePattern } from '../helpers.js'
import type { Parameter } from '../Parameter/types.js'
import type { Value } from './types.js'

export const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

// prettier-ignore
export const parseSerializedValue = (name: string, serializedValue: string, spec: Parameter): Value => {
  const either = spec.type.deserialize(serializedValue)
  if (Either.isLeft(either)) {
    const expectedTypes = spec.type._tag
    throw new Error(`Failed to parse input ${name} with value ${serializedValue}. Expected type of ${expectedTypes}.`)
  }
  // TODO make return unknown
  const value = either.right // eslint-disable-line
  const type = typeof value
  if (type === `string`) return { _tag: `string`, value: value as string }
  if (type === `number`) return { _tag: `number`, value: value as number }
  if (type === `undefined`) return { _tag: `undefined`, value: undefined }
  if (type === `boolean`) {
    // dump(isEnvarNegated(name, spec))
    return { _tag: `boolean`, value: value as boolean, negated: isEnvarNegated(name, spec) }
  }
  throw new Error(`Supported type ${type}.`)
}

/**
 * Is the environment variable input negated? Unlike line input the environment can be
 * namespaced so a bit more work is needed to parse out the name pattern.
 */
export const isEnvarNegated = (name: string, spec: Parameter): boolean => {
  const nameWithNamespaceStripped = stripeNamespace(name, spec)
  // dump({ nameWithNamespaceStripped })
  return negateNamePattern.test(nameWithNamespaceStripped)
}

export const isNegated = (name: string): boolean => {
  return negateNamePattern.test(name)
}

const stripeNamespace = (name: string, spec: Parameter): string => {
  for (const namespace of spec.environment?.namespaces ?? []) {
    if (name.startsWith(namespace)) return camelCase(name.slice(namespace.length))
  }
  return name
}
