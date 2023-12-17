import { expectTypeOf, test } from 'vitest'
import { t } from '../../../src/_entrypoints/default.js'
import type { BuilderKit } from '../../../src/lib/BuilderKit/BuilderKit.js'

const t1 = t.enum([`json`, `yaml`, `toml`])
type t1 = typeof t1
// const t2 = t.enum([`json`, `yaml`, `toml`]).description(`abc`)
// type t2 = typeof t2

// prettier-ignore
test('types', () => {
	expectTypeOf<BuilderKit.State.Property.Value.IsSet<BuilderKit.State.Get<t1>, 'members'>>().toEqualTypeOf<true>()
	expectTypeOf<BuilderKit.State.Get<t1>['members']['value']>().toEqualTypeOf<['json','yaml','toml']>()
})
