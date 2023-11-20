import { expect } from 'vitest'
import { it } from 'vitest'
import { $, s } from '../_/helpers.js'
import { environmentManager } from './__helpers__.js'

it(`snake case environment variables are matched to parameters`, () => {
  environmentManager.set(`cli_param_foo_bar`, `toto`)
  const args = $.parameter(`fooBar`, s).parse({ line: [] })
  expect(args).toMatchObject({ fooBar: `toto` })
})

it(`environment variables are read case insensitive`, () => {
  environmentManager.set(`CLI_param_fOo_bAR`, `toto`)
  const args = $.parameter(`fooBar`, s).parse({ line: [] })
  expect(args).toMatchObject({ fooBar: `toto` })
})
