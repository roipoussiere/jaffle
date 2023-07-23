/*
 ┌───────────┐     ┌───────────┐     ┌───────────┐
 │           │     │           │     │           │
 │ D3 graph  │     │   Yaml    │     │JavaScript │
 │           │     │           │     │           │
 └───────┬───┘     └───────┬───┘     └───┬───────┘
     ▲   │             ▲   │             ┆   ▲
     │   ▼             │   ▼             ▽   │
 ┌───┴───────┐     ┌───┴───────┐     ┌───────┴───┐
 │           │     │           │◁╌╌╌╌┤           │
 │   VBox    ├────▶│ (Raw)Box  │     │  Vertex   │
 │r,t,id,geom│     │raw        ├────▶│type,entry │
 └───────────┘     └─────┬─────┘     └───────────┘
       ▲  ┌───────────┐  │
       │  │           │  │
       └──┤PartialVBox│◀─┘
          │raw,type,id│
          └───────────┘
*/

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

export interface RawBox {
	rawName: string,
	rawValue: string,

	children: Array<RawBox>,
}

export interface PartialVBox extends RawBox {
	id: string,
	groupId: number,
	// lastSibling: string, // TODO instead Graph.getLastFunc(n)

	displayName: string,
	displayValue: string,

	children: Array<PartialVBox>,
}

export interface VBox extends PartialVBox {
	contentWidth: number,
	padding: number,
	width: number,
	// isStacked: boolean, // TODO instead Graph.shouldStack(a, b)

	children: Array<VBox>,
}

export interface Vertex {
	type: BoxType,
	value: unknown,

	children: Array<Vertex>,
}

export interface Dict<T> {
	[key: string]: T;
}
