export enum FuncType {
	Root,
	Main,
	Chained,
	Serialized,
	Mininotation,
	Expression,
	Constant,
	List,
	Anon,
}

export enum ValueType {
	None,
	Children,
	Mininotation,
	Expression,
	String,
	Number,
	Null,
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
