import { t } from 'packages/@molt/command/src/_entrypoints/default.js'
import type { BuilderKit } from 'packages/@molt/command/src/lib/BuilderKit/BuilderKit.js'
import type { T } from '../../_/helpers.js'

const t1 = t.enum([`json`, `yaml`, `toml`])
type t1 = typeof t1
// const t2 = t.enum([`json`, `yaml`, `toml`]).description(`abc`)
// type t2 = typeof t2

// prettier-ignore
type _ = [
	T<BuilderKit.State.Property.Value.IsSet<BuilderKit.State.Get<t1>, 'members'>, true>,
	T<BuilderKit.State.Get<t1>['members']['value'], ['json','yaml','toml']>
]
