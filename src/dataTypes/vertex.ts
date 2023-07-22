export enum VertexType {
	MainFunc, // ie. "stack(...)"
	// Mininotation, // '"c@3 eb"'
	// Expression, // ie. "myVar"
	ChainedFunc, // ie. ".range()"
	Object, // ie. "sine"
	ConstantDef, // ie. "const myVar = ..."
	SerializedData, // ie. '{"a": 42}'
	// List, // ie. "[1, 2]"
	Literal, // ie. "null", "42", "'abc'"
}

export type Vertex = {
	type: VertexType,
	value: unknown,
	children: Array<Vertex>,
};
