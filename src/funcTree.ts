export enum VertexType {
	MainFunc, // ie. "stack(...)"
	Mininotation, // '"c@3 eb"'
	Expression, // ie. "myVar"
	ChainedFunc, // ie. ".range()"
	Object, // ie. "sine"
	ConstantDef, // ie. "const myVar = ..."
	SerializedData, // ie. '{"a": 42}'
	// List, // ie. "[1, 2]"
	Literal, // ie. "null", "42", "'abc'"
}

// eslint-disable-next-line no-use-before-define
export type Children = Array<Vertex>;

export type Vertex = {
	type: VertexType,
	value: unknown,
	children: Children,
};
