// TODO make type safe
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
      type: [`missing`, `invalid`],
    },
  },
}
