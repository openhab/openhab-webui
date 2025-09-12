export type Breakpoint<T> =
	| number
	| {
			default: T;
			[value: number]: T;
	  };
