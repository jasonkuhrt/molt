# molt

A set of packages related to building CLIs. Alpha maturity. Each package has its own docs.

| 📛  | Package         | Path                                          | Description                                                                | Use Case                                                                                              |
| --- | --------------- | --------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 🌲  | `molt`          | [packages/molt](./packages/molt/)             | Batteries included CLI framework. Builds on top of the `@molt/*` packages. | Building a CLI with multiple commands, sub-commands, etc.                                             |
| 🌱  | `@molt/command` | [packages/@molt/command](./packages/command/) | Simple command definition.                                                 | Just want to setup a quick and dirty script, build a small one-command CLI, etc.                      |
| ⛑   | `@molt/types`   | [packages/@molt/types](./packages/types/)     | Advanced Types for parsing flags & more.                                   | Building your own CLI runtime, but looking for some TypeScript utility types for greater type safety. |
