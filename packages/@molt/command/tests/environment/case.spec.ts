import { Command } from '../../src/index.js'
import { environmentManager } from './__helpers__.js'
import { expect } from 'vitest'
import { it } from 'vitest'
import { z } from 'zod'

it(`snake case environment variables are matched to parameters`, () => {
  environmentManager.set(`cli_param_foo_bar`, `toto`)
  const args = Command.create({ fooBar: z.string() }).parseOrThrow([])
  expect(args).toMatchObject({ fooBar: `toto` })
})

it(`environment variables are read case insensitive`, () => {
  environmentManager.set(`CLI_param_fOo_bAR`, `toto`)
  const args = Command.create({ fooBar: z.string() }).parseOrThrow([])
  expect(args).toMatchObject({ fooBar: `toto` })
})
