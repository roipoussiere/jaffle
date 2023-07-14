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
	Null,
	Number,
	String,
	Mininotation,
	Expression,
	Object,
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
