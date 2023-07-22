export enum BoxType {
	MainFunc,
	Mininotation,
	Expression,
	ChainedFunc,
	Object,
	ConstantDef,
	SerializedData,
	List,
	Literal,
}

export enum BoxValueType {
	Null,
	Boolean,
	Number,
	String,
	Mininotation,
	Expression,
	Empty,
}

export type Box = {
	name: string,
	type: BoxType,
	value: unknown,
	valueType: BoxValueType,
	children: Array<Box>,
};

export interface Dict<T> {
	[key: string]: T;
}
