/*
 ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
 │              │       │              │       │              │
 │   D3 graph   │       │     Yaml     │       │  JavaScript  │
 │              │       │              │       │              │
 └─────────┬────┘       └─────────┬────┘       └────┬─────────┘
      ▲    │                 ▲    │                 ┆    ▲
      │    ▼                 │    ▼                 ▽    │
 ┌────┴─────────┐       ┌────┴─────────┐       ┌─────────┴────┐
 │   Box tree   │       │  Entry tree  │       │ AstNode tree │
 ├──────────────┤       ├──────────────┤       ├──────────────┤
 │- EntryData   ├──────▶│- EntryData   ├──────▶│- AstNodeData │
 │- BoxInternal │       │              │       │              │
 │- BoxDisplay  │◀──────┤              │◁╌╌╌╌╌╌┤              │
 │- BoxTyping   │       │              │       │              │
 │- BoxGeometry │       │              │       │              │
 └──────────────┘       └──────────────┘       └──────────────┘
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

export interface EntryData {
	rawName: string,
	rawValue: string,
}

export interface Entry extends EntryData {
	children: Array<Entry>,
}

export interface BoxInternal {
	id: string,
	groupId: number,
	// lastSiblingId: string, // TODO instead Graph.getLastFunc(n) and Graph.getShouldStack(n)
}

export interface BoxDisplay {
	displayName: string,
	displayValue: string,
}

export interface BoxTyping {
	type: BoxType,
	valueType: ValueType,
}

export interface BoxGeometry {
	padding: number,
	width: number,
}

export interface Box extends EntryData, BoxInternal, BoxDisplay, BoxTyping, BoxGeometry {
	children: Array<Box>,
}

export interface AstNodeData {
	type: BoxType,
	value: unknown,
}

export interface AstNode extends AstNodeData {
	children: Array<AstNode>,
}

export interface Dict<T> {
	[key: string]: T;
}
