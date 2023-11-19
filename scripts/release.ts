import { Zod } from '../packages/@molt/command/src/_entrypoints/extensions.js'
import { Command } from '../packages/@molt/command/src/index.js'
import { Octokit } from '@octokit/core'
import { Alge } from 'alge'
import { execa } from 'execa'
import Fs from 'fs-jetpack'
import * as Path from 'node:path'
import url from 'node:url'
import Semver from 'semver'
import semverRegex from 'semver-regex'
import { z } from 'zod'

// prettier-ignore
const args = Command.create()
  .use(Zod)
  .parameter(`githubToken`, z.string())
  .parameter(`publish`, z.boolean().default(true))
  .parameter(`githubRelease`, z.boolean().default(true))
  .parameter(`p package`, z.enum([`@molt/command`, `@molt/types`, `molt`]))
  .parametersExclusive(`method`, (__) => 
    __
      .parameter(`v version`, z.string().regex(semverRegex()))
      .parameter(`b bump`, z.enum([`major`, `minor`, `patch`]))
  )
  .settings({
    parameters: {
      environment: {
        githubToken: { prefix: false },
      },
    },
  })
  .parse()

const cwd = Path.join(Path.dirname(url.fileURLToPath(import.meta.url)), `../packages`, args.package)
const $Fs = Fs.cwd(cwd)

const workspacePkg = (await Fs.readAsync(`package.json`, `json`)) as {
  name: string
  version: string
  repository: string
}

const pkg = (await $Fs.readAsync(`package.json`, `json`)) as {
  name: string
  version: string
  repository: string
}

if (!args.method) throw new Error(``)

const newVersion = Alge.match(args.method)
  .bump((_) => Semver.inc(pkg.version, _.value)!) // eslint-disable-line
  .version((_) => _.value)
  .done()

const gitTagName = `${args.package}@${newVersion}`

const match = workspacePkg.repository.match(/git@github.com:(.+)\/(.+)\.git/)

if (!match) throw new Error(`Invalid repository URL: ${workspacePkg.repository}`)

const repo = {
  // eslint-disable-next-line
  owner: match[1]!,
  // eslint-disable-next-line
  name: match[2]!,
}

if (args.publish) {
  await $Fs.writeAsync(`package.json`, JSON.stringify({ ...pkg, version: newVersion }, null, 2) + `\n`)
  await execa(`git`, [`add`, `package.json`], { cwd })
  await execa(`git`, [`commit`, `--message`, `chore(${args.package}): bump version`], { stdio: `inherit` })
  await execa(`pnpm`, [`publish`], { cwd, stdio: `inherit` })
  // prettier-ignore
  await execa(`git`, [`tag`, gitTagName, `--annotate`, `--message`, `Version ${newVersion} for package ${args.package}`], { stdio: `inherit` })
  await execa(`git`, [`push`], { stdio: `inherit` })
  await execa(`git`, [`push`, `--tags`], { stdio: `inherit` })
}

if (args.githubRelease) {
  const octokit = new Octokit({
    auth: args.githubToken,
  })

  await octokit.request(`POST /repos/{owner}/{repo}/releases`, {
    owner: repo.owner,
    repo: repo.name,
    tag_name: gitTagName,
    target_commitish: `main`,
    name: gitTagName,
    body: `todo`,
    draft: false,
    prerelease: false,
    generate_release_notes: false,
  })
}
