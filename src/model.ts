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

export type StringDict = { [key: string]: string };

export interface EntryData {
	rawName: string,
	rawValue: string,
}

export interface Entry extends EntryData {
	children: Array<Entry>,
}

export interface Dict<T> {
	[key: string]: T;
}
