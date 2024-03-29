import type { Name } from '@molt/name'
import camelCase from 'lodash.camelcase'
import type { Settings } from '../../Settings/index.js'
import type { Environment } from './types.js'

/**
 * Parse the specification for a parameter's environment support.
 */
export const processEnvironment = (settings: Settings.Output, name: Name.Data.NameParsed): Environment => {
  const hasEnvironment = settings.parameters.environment[name.canonical]?.enabled
    ?? settings.parameters.environment.$default.enabled
  return hasEnvironment
    ? {
      enabled: hasEnvironment,
      namespaces: (
        settings.parameters.environment[name.canonical]?.prefix
          ?? settings.parameters.environment.$default.prefix
      ).map((_) => camelCase(_)),
    }
    : null
}
