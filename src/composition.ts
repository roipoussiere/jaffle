export enum FuncType {
	None,
	Main,
	Mininotation,
	Expression,
	Chained,
	Constant,
	Serialized
}

export enum ValueType {
	None,
	Children,
	Mininotation,
	Expression,
	String,
	Number,
}

export type Func = {
	id: number,
	name: string,
	type: FuncType,
	value: string,
	valueType: ValueType,
	groupId: number,
	params: Array<Func>,
	// group: Array<TuneFunc>, // better to have this in d3.hierarchy
	// main: TuneFunc,
	// last: TuneFunc,
};

export type Literal = string | number | null;

export type FuncChain = Array<Func>;

export type Composition = Array<FuncChain>;
