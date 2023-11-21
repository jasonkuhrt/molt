import { expectType } from 'tsd'
import type { Name } from '../src/_entrypoints/default.js'
import { as } from './_/helpers.js'

expectType<Name.Errors.Empty>(as<Name.Parse<''>>())
expectType<Name.Errors.Empty>(as<Name.Parse<' '>>())

// Short Flag
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'a'>>>(
  as<Name.Parse<'-a', { reservedNames: 'a'; usedNames: undefined }>>(),
)
// Long Flag
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'abc'>>>(
  as<Name.Parse<'--abc', { reservedNames: 'abc'; usedNames: undefined }>>(),
)
// Mixing dash prefix style and kebab/camel case does not matter
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>(
  as<Name.Parse<'--foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>(
  as<Name.Parse<'--fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>(
  as<Name.Parse<'foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>(
  as<Name.Parse<'fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>(),
)
// Aliases
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>(
  as<Name.Parse<'--foo --foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>(
  as<Name.Parse<'--foo --fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>(
  as<Name.Parse<'foo foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>(
  as<Name.Parse<'foo fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>(),
)

// Short Flag
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'a'>>>(
  as<Name.Parse<'-a', { usedNames: 'a'; reservedNames: undefined }>>(),
)
// Long Flag
expectType<'Error(s):\nThe name "abc" cannot be used because it is already used for another flag.'>(
  as<Name.Parse<'--abc', { usedNames: 'abc'; reservedNames: undefined }>>(),
)
// Mixing dash prefix style and kebab/camel case does not matter
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>(
  as<Name.Parse<'--fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>(
  as<Name.Parse<'--foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>(
  as<Name.Parse<'fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>(
  as<Name.Parse<'foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>(),
)
// Aliases
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>(
  as<Name.Parse<'--foo --fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>(
  as<Name.Parse<'--foo --foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>(
  as<Name.Parse<'foo fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>(
  as<Name.Parse<'foo foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>(),
)

expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.LongTooShort<'v'>>>(as<Name.Parse<'--v'>>())
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.LongTooShort<'v'>>>(as<Name.Parse<'--ver --v'>>())
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.ShortTooLong<'vv'>>>(as<Name.Parse<'-vv'>>())

expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'vv'>>>(as<Name.Parse<'--vv --vv'>>())
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'v-v'>>>(
  as<Name.Parse<'--v-v --v-v'>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'v'>>>(as<Name.Parse<'-v -v'>>())
// Mixing dash prefix style and kebab/camel case does not matter
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>(
  as<Name.Parse<'--fooBar --foo-bar'>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>(
  as<Name.Parse<'--foo-bar --fooBar'>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>(
  as<Name.Parse<'fooBar foo-bar'>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>(
  as<Name.Parse<'foo-bar fooBar'>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>(
  as<Name.Parse<'foo-bar --fooBar'>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>(
  as<Name.Parse<'--foo-bar fooBar'>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>(
  as<Name.Parse<'fooBar --foo-bar'>>(),
)
expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>(
  as<Name.Parse<'--fooBar foo-bar'>>(),
)
