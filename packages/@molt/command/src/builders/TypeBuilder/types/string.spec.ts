import { describe, expect, expectTypeOf, test } from 'vitest'
import { string } from './string.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const s = string()
const state = BuilderKit.State.get(s)

test.todo(`todo`)
