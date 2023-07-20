export enum VertexType {
	Func,
	ExpressionFunc,
	MininotationFunc,
	ChainedFunc,
	ConstantDef,
	SerializedData,
	List,
	Literal,
}

// eslint-disable-next-line no-use-before-define
export type Children = Array<Vertex>;

export type Vertex = {
	type: VertexType,
	value: unknown,
	children: Children,
};
