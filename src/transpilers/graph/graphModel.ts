import { EntryType, ValueType, EntryData } from '../../model';

export interface BoxInternal {
	id: string,
	groupId: number,
	lastSiblingId: string,
	// stack: boolean, // TODO instead of Graph.getShouldStack(n)?
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
