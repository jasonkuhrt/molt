import type { Name } from '../src/_entrypoints/default.js'
import { expectTypeOf, test } from 'vitest'

// prettier-ignore
test('errors', () => {
  expectTypeOf<Name.Errors.Empty>().toMatchTypeOf<Name.Parse<''>>()
  expectTypeOf<Name.Errors.Empty>().toMatchTypeOf<Name.Parse<' '>>()

  // Short Flag
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'a'>>>().toMatchTypeOf<Name.Parse<'-a', { reservedNames: 'a'; usedNames: undefined }>>()
  // Long Flag
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'abc'>>>().toMatchTypeOf<Name.Parse<'--abc', { reservedNames: 'abc'; usedNames: undefined }>>()
  // Mixing dash prefix style and kebab/camel case does not matter
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'--foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>().toMatchTypeOf<Name.Parse<'--fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>().toMatchTypeOf<Name.Parse<'fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>()
  // Aliases
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'--foo --foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>().toMatchTypeOf<Name.Parse<'--foo --fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'foo foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>().toMatchTypeOf<Name.Parse<'foo fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>()

  // Short Flag
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'a'>>>().toMatchTypeOf<Name.Parse<'-a', { usedNames: 'a'; reservedNames: undefined }>>()
  // Long Flag
  expectTypeOf<'Error(s):\nThe name "abc" cannot be used because it is already used for another flag.'>().toMatchTypeOf<Name.Parse<'--abc', { usedNames: 'abc'; reservedNames: undefined }>>()
  // Mixing dash prefix style and kebab/camel case does not matter
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>().toMatchTypeOf<Name.Parse<'--fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'--foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>().toMatchTypeOf<Name.Parse<'fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>()
  // Aliases
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>().toMatchTypeOf<Name.Parse<'--foo --fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'--foo --foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>().toMatchTypeOf<Name.Parse<'foo fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'foo foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>()

  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.LongTooShort<'v'>>>().toMatchTypeOf<Name.Parse<'--v'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.LongTooShort<'v'>>>().toMatchTypeOf<Name.Parse<'--ver --v'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.ShortTooLong<'vv'>>>().toMatchTypeOf<Name.Parse<'-vv'>>()

  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'vv'>>>().toMatchTypeOf<Name.Parse<'--vv --vv'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'v-v'>>>().toMatchTypeOf<Name.Parse<'--v-v --v-v'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'v'>>>().toMatchTypeOf<Name.Parse<'-v -v'>>()
  // Mixing dash prefix style and kebab/camel case does not matter
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'--fooBar --foo-bar'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>().toMatchTypeOf<Name.Parse<'--foo-bar --fooBar'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'fooBar foo-bar'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>().toMatchTypeOf<Name.Parse<'foo-bar fooBar'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>().toMatchTypeOf<Name.Parse<'foo-bar --fooBar'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>().toMatchTypeOf<Name.Parse<'--foo-bar fooBar'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'fooBar --foo-bar'>>()
  expectTypeOf<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>().toMatchTypeOf<Name.Parse<'--fooBar foo-bar'>>()
})
