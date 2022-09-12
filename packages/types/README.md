# @molt/types

⛑ Advanced Types for parsing CLI flags and more.

## Installation

```
npm add @molt/types
```

## API

### `FlagName`

The `FlagName` namespace provides a `Parse` type and some other utility types. `Parse` turns an expression of CLI flags into structured object type data _at the type level_.

#### Features

- Capture long flag
- Capture short flag
- Capture alias short flags
- Capture alias long flags
- Flexible syntax
  - Optional leading dashes `--`/`-`
- Clear human-friendly error messages when parsing fails.
  - Catch name duplicate
  - Enforce reserved names
- Statically Normalize kebob case to camel case

#### Example

```ts
import { FlagName } from '@molt/types'

const defineFlag = <Name>(
  name: FlagName.Errors.$Is<FlagName.Parse<Name>> extends true ? FlagName.Parse<Name> : Name
) => {
  // ...
}

defineFlag(``) // Static type error
defineFlag(`-`) // Static type error
defineFlag(`--`) // Static type error
defineFlag(`--a`) // Static type error
defineFlag(`-ab`) // Static type error
defineFlag(`--version -`) // Static type error
defineFlag(`-v -v`) // Static type error
defineFlag(`--version`) // ok
defineFlag(`--version --ver`) // ok
defineFlag(`--version --ver -v`) // ok
defineFlag(`-v`) // ok
```
