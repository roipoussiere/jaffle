/*
 ┌──────────────┐       ┌──────────────┐
 │              │       │              │
 │   D3 graph   │       │     Yaml     │
 │              │       │              │
 └─────────┬────┘       └─────────┬────┘
      ▲    │                 ▲    │
      │    ▼                 │    ▼
 ┌────┴─────────┐       ┌────┴─────────┐
 │   Box tree   │       │  Entry tree  │
 ├──────────────┤       ├──────────────┤       ┌──────────────┐
 │- EntryData   ├──────▶│- EntryData   │       │              │
 │- BoxInternal │       │              ├──────▶│  JavaScript  │
 │- BoxDisplay  │◀──────┤              │       │              │
 │- BoxTyping   │       │              │       └──────────────┘
 │- BoxGeometry │       │              │
 └──────────────┘       └──────────────┘
*/

export enum EntryType {
	Value,
	Function,
	MininotationFunction,
	ExpressionFunction,
	ChainedFunction,
	LambdaFunction,
	Object,
	List,
	ConstantDef,
	SerializedData,
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
	lastSiblingId: string,
	// stack: boolean, // TODO instead of Graph.getShouldStack(n)
}

export interface BoxDisplay {
	displayName: string,
	displayValue: string,
}

export interface BoxTyping {
	type: EntryType,
	valueType: ValueType,
}

export interface BoxGeometry {
	padding: number,
	width: number,
}

export interface Box extends EntryData, BoxInternal, BoxDisplay, BoxTyping, BoxGeometry {
	children: Array<Box>,
}

export interface Dict<T> {
	[key: string]: T;
}
