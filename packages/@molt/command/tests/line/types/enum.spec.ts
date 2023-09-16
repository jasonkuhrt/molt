import { Command } from '../../../src/index.js'
import { s } from '../../_/helpers.js'
import { stdout } from '../../_/mocks.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`errors`, () => {
  it(`when argument missing (last position)`, () => {
    Command.create()
      .parameter(`--mode`, z.enum([`a`, `b`]))
      .parse({ line: [`--mode`] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`when argument missing (non-last position)`, () => {
    // prettier-ignore
    Command.create().parameter( `--name`, s).parameter( `--mode`, z.enum([`a`,`b`]) ).parse({line:[` --mode`, `--name`, `joe`]})
    expect(stdout.mock.calls).toMatchSnapshot()
  })
  it(`is validated`, () => {
    // const args = Parameters.create({ '--mode': z.enum([`a`, `b`, `c`]) }).parse({line:[`--mode`, `bad`]})
    // assert<IsExact<{ mode: 'a'|'b'|'c' }, typeof args>>(true)
    // expect(args).toMatchObject({ mode: true })
    Command.create()
      .parameter(`--mode`, z.enum([`a`, `b`, `c`]))
      .parse({ line: [`--mode`, `bad`] })
    expect(stdout.mock.calls).toMatchSnapshot()
  })
})
