import type { ParameterSpec } from './ParameterSpec/index.js'
import type { Pattern } from './Pattern/Pattern.js'
import type { z } from 'zod'

export type EventPatternOptionality = ParameterSpec.Output.BasicOptionality['_tag']

export type EventPatternRejectedType = 'missing' | 'invalid'

export interface ArgumentAcceptedEvent {
  type: 'ArgumentAcceptedEvent'
  value: ParameterSpec.ArgumentValue
  optionality?: EventPatternOptionality
}

export interface ArgumentRejectedEvent {
  type: 'ArgumentRejectedEvent'
  reason: EventPatternRejectedType
  optionality: EventPatternOptionality
}

export interface ArgumentOmittedEvent {
  type: 'ArgumentOmittedEvent'
  optionality: Exclude<EventPatternOptionality, 'required'>
}

// prettier-ignore
export interface EventPatternsInput<Schema extends ParameterSpec.Input.Schema = ParameterSpec.Input.Schema> {
  accepted?: Pattern<ArgumentAcceptedEvent>
  rejected?: Pattern<ArgumentRejectedEvent>
  omitted?: Schema 										 extends any 																  ? Pattern<ArgumentOmittedEvent> :
						Schema['_def']['typeName'] extends z.ZodFirstPartyTypeKind.ZodOptional 	? Pattern<ArgumentOmittedEvent> :
						Schema['_def']['typeName'] extends z.ZodFirstPartyTypeKind.ZodDefault   ? Pattern<ArgumentOmittedEvent> :
																																											'Not Available. Only when parameter optional or has default.'
																																											
}

export const eventPatterns = {
  always: {
    accepted: {},
    omitted: {},
    rejected: {},
  },
  omitted: {
    omitted: {
      optionality: [`optional`, `default`],
    },
  },
  omittedWithoutDefault: {
    omitted: {
      optionality: `optional`,
    },
  },
  omittedWithDefault: {
    omitted: {
      optionality: `default`,
    },
  },
  rejectedMissingOrInvalid: {
    rejected: {
      reason: [`missing`, `invalid`],
    },
  },
} satisfies Record<string, EventPatternsInput>
