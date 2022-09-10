# @molt/parameters

⛑ Simple type-safe CLI flag parsing.

## Installation

```
npm add @molt/parameters
```

## API

### ``

Define the fl

#### Example

```ts
// convert.ts
import { Parameters } from '@molt/parameters'
import { z } from 'zod'

const args = Parameters.define({
  filePath: z.string().describe(`Path to the file to convert.`),
  to: z.enum(['json', ' yaml', 'toml']).describe(`Format to convert to.`),
  from: z.enum(['json', 'yaml', 'toml']).optional().describe(`Format to convert from.`),
  verbose: z.boolean().optional().default(false).describe(`Log detailed progress as conversion executes.`),
}).parse()

args.filePath
args.to
args.from
args.verbose
```

```
ts-node convert --file ./music.yaml --to json
```
