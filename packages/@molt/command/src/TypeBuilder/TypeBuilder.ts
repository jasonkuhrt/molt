import type { Type } from '../Type/helpers.js'
import type { Extension } from './extension.js'

// prettier-ignore
type TypeBuilderBase<$Extensions extends Record<string, object>> = $Extensions & {
	$use: <
		$Namespace extends string,
		$Type extends Type<any>,
		$Builder extends (...args: any[]) => $Type,
		$Extension extends Extension<$Namespace, $Type,$Builder>,
	>(extension: $Extension) =>
		TypeBuilderBase<{ [k in $Extension['namespace']]: $Extension['builder'] } & $Extensions>
}

export const $use: TypeBuilderBase<{}>['$use'] = (extension) => {
  // todo
}
