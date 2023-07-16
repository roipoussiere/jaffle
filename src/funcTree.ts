export enum FuncType {
	Constant,
	MainExpression,
	MainMininotation,
	Main,
	Root,
	Chained,
	Serialized,
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
	id: string,
	groupId: number,
	label: string,
	type: FuncType,
	valueText: string,
	valueType: ValueType,
	params: Array<FuncTree>,
};

export type Params = Array<FuncTree>;
