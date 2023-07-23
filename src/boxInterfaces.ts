/*
UI -> GBox -> Box -> Vertex -> Js
UI -> GBox -> Box -> GBox -> UI
Yaml -> Box -> GBox -> UI
Yaml -> Box -> Vertex -> Js
*/

// enums

export enum BoxType {
	MainFunc,
	ChainedFunc,
	// Object,
	ConstantDef,
	SerializedData,
	List,
	Value,
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

// data sets

export interface Dict<T> {
	[key: string]: T;
}

export interface BoxRaw {
	rawName: string, // ie. "mfunc", ".cfunc", "$var"
	rawValue: string, // ie. "a", "_12", "'40", "=12+5"
}

export interface BoxEntry {
	name: string,
	value: unknown,
}

export interface BoxInternal {
	id: string,
	groupId: number,
	// lastSibling: string, // TODO instead Graph.getLastFunc(n)
}

export interface BoxDisplay {
	displayName: string,
	displayValue: string,
}

export interface BoxGeometry {
	contentWidth: number,
	padding: number,
	width: number,
	// isStacked: boolean, // TODO instead Graph.shouldStack(a, b)
}

export interface BoxTyping {
	type: BoxType,
	valueType: BoxValueType,
}

// Trees

export interface Vertex {
	type: BoxType,
	value: unknown,
	children: Array<Vertex>,
}

export interface Box extends BoxRaw, BoxTyping {
	children: Array<Box>,
}

export interface PartialVBox extends BoxRaw, BoxInternal, BoxDisplay {
	children: Array<PartialVBox>,
}

export interface VBox extends BoxRaw, BoxInternal, BoxDisplay, BoxTyping, BoxGeometry {
	children: Array<VBox>,
}
