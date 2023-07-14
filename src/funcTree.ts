export enum FuncType {
	Root,
	Main,
	MainMininotation,
	Chained,
	Serialized,
	// Expression,
	Constant,
	List,
	LiteralValue,
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
	id: number,
	groupId: number,
	label: string,
	type: FuncType,
	valueText: string,
	valueType: ValueType,
	params: Array<FuncTree>,
};

export type Params = Array<FuncTree>;
