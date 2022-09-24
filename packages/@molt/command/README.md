# @molt/command

🌱 Simple type-safe CLI command parsing..

## Installation

```
npm add @molt/command
```

## Features

- Automatic parameter parsing based on specified Zod types.
- Normalization between camel/kebab case:

  - Kebab case parameter spec normalized to camel
    ```ts
    // foobar.ts
    const args1 = Command.create({ '--do-it': z.boolean() }).parseOrThrow()
    const args2 = Command.create({ '--doIt': z.boolean() }).parseOrThrow()
    args1.doIt
    args2.doIt
    ```
  - Kebab case parameter input normalized to camel.
    ```
    $ ts-node foobar.ts --do-it
    $ ts-node foobar.ts --doIt
    ```

- Short and/or long flag names plus as many short/long aliases as you wish.
  ```ts
  Command.create({ '-f --force --forcefully': z.boolean() }).parseOrThrow()
  ```
- Leverage Zod `.default(...)` method for setting default values.

  ```ts
  // foobar.ts
  const args = Command.create({ '--path': z.string().default('./a/b/c') }).parseOrThrow()
  // Given: $ ts-node foobar.ts
  args.path === './a/b/c/'
  // Given: $ ts-node foobar.ts --path /over/ride
  args.path === '/over/ride'
  ```

- Leverage Zod `.describe(...)` for automatic docs.
- Pass arguments via environment variables (customizable)

  ```ts
  // foobar.ts
  const args = Command.create({ '--path': z.string() }).parseOrThrow()
  // Given: $ CLI_PARAM_PATH='./a/b/c' ts-node foobar.ts
  args.path === './a/b/c/'
  ```

- In the future: automatic help generation.

## Environment Arguments

Parameter arguments can be passed by environment variables instead of traditional flags.

Flags take precedence over environment variables because flags generally come later than environment variables (e.g. shell has some exported environment variables).

Environment variables follow this pattern by default:

```
{prefix}_{parameter_name}
```

Accepted prefix by default is `CLI_PARAMETER` or `CLI_PARAM` (case insensitive).

```ts
// foobar.ts
const args = Command.create({ '--path': z.string() }).parseOrThrow()
// Given: $ CLI_PARAMETER_PATH='./a/b/c' ts-node foobar.ts
args.path === './a/b/c/'
```

You can toggle this feature on/off. It is on by default.

```ts
// foobar.ts
const command = Command.create({ '--path': z.string() }).settings({
  environmentArguments: false,
})
// Given: $ CLI_PARAMETER_PATH='./a/b/c' ts-node foobar.ts
// Throws error because no argument given for "path"
command.parseOrThrow()
```

You can also toggle on/off via the environment variable `CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT` (case insensitive):

```ts
// foobar.ts
const command = Command.create({ '--path': z.string() }).settings({
  environmentArguments: false,
})
// Given: $ CLI_SETTINGS_READ_ARGUMENTS_FROM_ENVIRONMENT='false' CLI_PARAMETER_PATH='./a/b/c' ts-node foobar.ts
// Throws error because no argument given for "path"
command.parseOrThrow()
```

You can customize the prefix:

```ts
// foobar.ts
const args = Command.create({ '--path': z.string() })
  .settings({
    environmentArguments: {
      prefix: 'foo', // case insensitive
    },
  })
  .parseOrThrow()

// Given: $ FOO_PATH='./a/b/c' ts-node foobar.ts
args.path === './a/b/c/'
```

You can pass a list of accepted prefixes instead of just one. Earlier ones take precedence over later ones:

```ts
// foobar.ts
const args = Command.create({ '--path': z.string() })
  .settings({
    environmentArguments: {
      prefix: ['foobar', 'foo'], // case insensitive
    },
  })
  .parseOrThrow()

// Given: $ FOO_PATH='./a/b/c' ts-node foobar.ts
args.path === './a/b/c/'
```

You can remove the prefix altogether (succinct but be careful for collisions with host environment variables that would affect your CLI execution!):

```ts
// foobar.ts
const args = Command.create({ '--path': z.string() })
  .settings({
    environmentArguments: {
      prefix: null,
    },
  })
  .parseOrThrow()

// Given: $ PATH='./a/b/c' ts-node foobar.ts
args.path === './a/b/c/'
```

By default, when a prefix is defined, a typo will raise an error:

```ts
// foobar.ts
const command = Command.create({ '--path': z.string() })

// Given: $ CLI_PARAM_PAH='./a/b/c' ts-node foobar.ts
// Throws error because there is no parameter named "pah" defined.
command.parseOrThrow()
```

Environment variables are considered in a case insensitive way so all of these work:

```ts
// foobar.ts
const args = Command.create({ '--path': z.string() }).parseOrThrow()
// Given: $ CLI_PARAM_PATH='./a/b/c' ts-node foobar.ts
// Given: $ cli_param_path='./a/b/c' ts-node foobar.ts
// Given: $ cLi_pAraM_paTh='./a/b/c' ts-node foobar.ts
args.path === './a/b/c/'
```

## Zod Types

Zod types affect flag parsing in the following ways.

### Boolean

- Flag does not accept any arguments.
- Flag of name e.g. `foo` can be passed as `--no-foo` or `--foo`. `--foo` leads to `true` while `--no-foo` leads to `false`.

Examples:

```ts
// foobar.ts
const args = Command.create({ '-f --force --forcefully': z.boolean() }).parseOrThrow()
// Given: $ ts-node foobar.ts --no-f
// Given: $ ts-node foobar.ts --noF
// Given: $ ts-node foobar.ts --no-force
// Given: $ ts-node foobar.ts --noForce
// Given: $ ts-node foobar.ts --no-forcefully
// Given: $ ts-node foobar.ts --noForcefully
args.force === false
// Given: $ ts-node foobar.ts -f
// Given: $ ts-node foobar.ts --force
// Given: $ ts-node foobar.ts --forcefully
args.force === true
```

### Number

- Flag expects an argument.
- Argument is cast via the `Number()` function.

### Enum

- Flag expects an argument.

## Example

```ts
// convert.ts
import { Command } from '@molt/command'
import { z } from 'zod'

const args = Command.parseOrThrow({
  '--file-path': z.string().describe(`Path to the file to convert.`),
  '--to': z.enum(['json', ' yaml', 'toml']).describe(`Format to convert to.`),
  '--from': z
    .enum(['json', 'yaml', 'toml'])
    .optional()
    .describe(`Format to convert from. By default inferred from the file extension.`),
  '--verbose -v': z.boolean().default(false).describe(`Log detailed progress as conversion executes.`),
  '--move -m': z.boolean().default(false).describe(`Delete the original file after it has been converted.`),
})

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
