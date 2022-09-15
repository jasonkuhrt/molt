import { Command } from '../packages/@molt/command/src/index.js'
import { execa, execaCommand } from 'execa'
import Fs from 'fs-jetpack'
import * as Path from 'node:path'
import url from 'node:url'
import semverRegex from 'semver-regex'
import { z } from 'zod'

const args = Command.create({
  'p package': z.enum([`@molt/command`, `@molt/types`, `molt`]),
  'v version': z.string().regex(semverRegex()),
}).parseOrThrow()

const cwd = Path.join(Path.dirname(url.fileURLToPath(import.meta.url)), `../packages`, args.package)

const pkg = (await Fs.readAsync(Path.join(cwd, `package.json`), `json`)) as { name: string; version: string }
await Fs.writeAsync(Path.join(cwd, `package.json`), { ...pkg, version: args.version }, { jsonIndent: 2 })
await execa(`git`, [`commit`, `--message`, `'chore(${args.package}): bump version'`], { stdio: `inherit` })
await execa(`pnpm`, [`publish`, `--access public`], { cwd, stdio: `inherit` })
await execa(`git`, [`tag`, args.version], { stdio: `inherit` })
await execa(`git`, [`push`, `--tags`], { stdio: `inherit` })
