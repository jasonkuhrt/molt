import { Command } from '../../src/index.js'
import { s } from '../_/helpers.js'
import { environmentManager } from './__helpers__.js'
import { expect } from 'vitest'
import { it } from 'vitest'

it(`snake case environment variables are matched to parameters`, () => {
  environmentManager.set(`cli_param_foo_bar`, `toto`)
  const args = Command.parameter(`fooBar`, s).parse({ line: [] })
  expect(args).toMatchObject({ fooBar: `toto` })
})

it(`environment variables are read case insensitive`, () => {
  environmentManager.set(`CLI_param_fOo_bAR`, `toto`)
  const args = Command.parameter(`fooBar`, s).parse({ line: [] })
  expect(args).toMatchObject({ fooBar: `toto` })
})
