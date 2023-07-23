/*
 ┌───────────┐     ┌───────────┐     ┌───────────┐
 │           │     │           │     │           │
 │ D3 graph  │     │   Yaml    │     │JavaScript │
 │           │     │           │     │           │
 └───────┬───┘     └───────┬───┘     └───┬───────┘
     ▲   └──────┐      ▲   │             ┆   ▲
     │          │      │   ▼             ▽   │
 ┌───┴───────┐  │  ┌───┴───────┐     ┌───────┴───┐
 │           │  └─▶│           │◁╌╌╌╌┤           │
 │    Box    │     │   Entry   │     │  AstNode  │
 │           ├────▶│           ├────▶│           │
 └───────────┘     └─────┬─────┘     └───────────┘
       ▲  ┌───────────┐  │
       │  │           │  │
       └──┤PartialBox │◀─┘
          │           │
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

export enum ValueType {
	Null,
	Boolean,
	Number,
	String,
	Mininotation,
	Expression,
	Empty,
}

export interface Entry {
	rawName: string,
	rawValue: string,

	children: Array<Entry>,
}

export interface PartialBox extends Entry {
	id: string,
	groupId: number,
	// lastSibling: string, // TODO instead Graph.getLastFunc(n)

	displayName: string,
	displayValue: string,

	children: Array<PartialBox>,
}

export interface Box extends PartialBox {
	contentWidth: number,
	padding: number,
	width: number,
	// isStacked: boolean, // TODO instead Graph.shouldStack(a, b)

	children: Array<Box>,
}

export interface AstNode {
	type: BoxType,
	value: unknown,

	children: Array<AstNode>,
}

export interface Dict<T> {
	[key: string]: T;
}
