export namespace Num {
  // prettier-ignore
  export type Increment<Int extends number> =
		Int extends 0 ? 1 :
		Int extends 1 ? 2 :
		Int extends 2 ? 3 :
		Int extends 3 ? 4 :
		Int extends 4 ? 5 :
		Int extends 5 ? 6 :
		Int extends 6 ? 7 :
		Int extends 7 ? 8 :
		Int extends 8 ? 9 :
		Int extends 9 ? 10 :
		Int extends 10 ? 11 :
		Int extends 11 ? 12 :
		Int extends 12 ? 13 :
		Int extends 13 ? 14 :
		Int extends 14 ? 15 :
		Int extends 15 ? 16 :
		Int extends 16 ? 17 :
		Int extends 17 ? 18 :
		Int extends 18 ? 19 :
		Int extends 19 ? 20 :
		Int extends 20 ? 21 :
		never
}

// prettier-ignore
export namespace Str {
	export type StartsWith<Prefix extends string, String extends string> = 
		Prefix extends `${infer head1}${infer tail1}` ?
			String extends `${infer head2}${infer tail2}` ?
				head1 extends head2 ?
					StartsWith<tail1,tail2>
				: false
			: false
		: true

	// prettier-ignore
	export type Length<String extends string > = Length_<0,String>

	type Length_<Count extends number, String extends string > =
		String extends `${infer head}${infer tail}` ? Length_<Num.Increment<Count>, tail> : Count
}
