# @molt/parameters

🎛 Simple type-safe CLI flag parsing.

## Installation

```
npm add @molt/parameters
```

## Example

```ts
// convert.ts
import { Parameters } from '@molt/parameters'
import { z } from 'zod'

const args = Parameters.create({
  '--file-path': z.string().describe(`Path to the file to convert.`),
  '--to': z.enum(['json', ' yaml', 'toml']).describe(`Format to convert to.`),
  '--from': z
    .enum(['json', 'yaml', 'toml'])
    .optional()
    .describe(`Format to convert from. By default inferred from the file extension.`),
  '--verbose -v': z.boolean().default(false).describe(`Log detailed progress as conversion executes.`),
  '--move -m': z.boolean().default(false).describe(`Delete the original file after it has been converted.`),
})
  .settings({
    description: `Convert a data file between the following formats: JSON, YAML, TOML`,
  })
  .parse()

// Normalized, validated, statically typed, and ready to go!
args.filePath
args.to
args.from
args.verbose
args.move
```

```
ts-node convert --file ./music.yaml --to json
```

On the roadmap, autogenerated help:

```
ts-node convert --help

Convert a data file between the following formats: JSON, YAML, TOML

PARAMETERS

  ---REQUIRED--------------------------------------------------------------

  to              Format to convert to.             enum:  json, yaml, toml

  file-path       Path to the file to convert.      string

  ---OPTIONAL--------------------------------------------------------------

  from            Format to convert from. By        enum:  json, yaml, toml   <dynamic>
                  default inferred from the file
                  extension.

  verbose         Log detailed progress.            boolean                   false
  v

  move            Delete the original file after    boolean                   false
  v               it has been converted.

  ---SPECIAL--------------------------------------------------------------

  help           Output this manual to stdout.
  h

SUB-COMMANDS

  help           Output this manual to stdout.

USAGE NOTES

- All parameters can be passed in "camelCase" or "kebab-case"
- All boolean parameters have a negated variant. E.g. for --verbose you can also pass --no-verbose
```