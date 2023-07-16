export enum FuncType {
	Constant,
	MainExpression,
	MainMininotation,
	Main,
	Chained,
	Serialized,
	List,
	Literal,
}

export enum ValueType {
	Empty,
	Null,
	Number,
	String,
	Mininotation,
	Expression,
	Tree,
}

export type FuncTree = {
	name: string,
	type: FuncType,
	value: unknown,
	valueType: ValueType,
	params: Array<FuncTree>,
};

export type Params = Array<FuncTree>;
