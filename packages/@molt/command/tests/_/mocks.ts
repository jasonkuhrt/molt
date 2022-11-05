import { beforeEach } from 'vitest'
import { mockProcessExit, mockProcessStdout } from 'vitest-mock-process'

export let stdout: ReturnType<typeof mockProcessStdout>
export let exit: ReturnType<typeof mockProcessExit>

beforeEach(() => {
  stdout = mockProcessStdout()
  exit = mockProcessExit()
})
