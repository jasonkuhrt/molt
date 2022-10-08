import { execaCommand } from 'execa'
// import Glob from 'fast-glob'
import Fs from 'fs-jetpack'
import * as Path from 'node:path'

const updatePackageJson = async (data: object) => {
  //eslint-disable-next-line
  const packageJson = await Fs.readAsync(`package.json`, `json`)
  await writePackageJson(`./`, { ...packageJson, ...data })
}

const writePackageJson = async (path: string, data: object) => {
  await Fs.writeAsync(Path.join(path, `package.json`), JSON.stringify(data, null, 2) + `\n`)
}

await execaCommand(`pnpm tsc --project tsconfig.esm.json`, { stdio: `inherit` })

await updatePackageJson({ type: `commonjs` })
await execaCommand(`pnpm tsc --project tsconfig.cjs.json`, { stdio: `inherit` })
await updatePackageJson({ type: `module` })
await writePackageJson(`./build/cjs`, { type: `commonjs` })
