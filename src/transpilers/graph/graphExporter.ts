import { Entry, ValueType, EntryData, EntryType } from '../../model';
import * as c from '../../constants';
import { entryToEntryType, entryToFuncName } from '../utils';

import { Box, BoxTyping, BoxDisplay } from './graphModel';

export function getValueType(entry: Entry): ValueType {
	let boxValueType: ValueType;
	if (entry.children.length > 0) {
		boxValueType = ValueType.Empty;
	} else if (entry.rawValue === '') {
		boxValueType = ValueType.Null;
	} else if (entry.rawValue[0] === c.MINI_STR_PREFIX) {
		boxValueType = ValueType.Mininotation;
	} else if (entry.rawValue[0] === c.EXPR_STR_PREFIX) {
		boxValueType = ValueType.Expression;
	} else if (!Number.isNaN(Number(entry.rawValue))) {
		boxValueType = ValueType.Number;
	} else if (entry.rawValue === 'true' || entry.rawValue === 'false') {
		boxValueType = ValueType.Boolean;
	} else {
		boxValueType = ValueType.String;
	}
	return boxValueType;
}

export function buildBoxTyping(entry: Entry): BoxTyping {
	return {
		type: entryToEntryType(entry),
		valueType: getValueType(entry),
		error: false,
	};
}

export function getDisplayValue(entry: Entry) {
	if (entry.rawValue === '') {
		return entry.children.length === 0 ? '∅' : ' ';
	}

	if (entry.rawValue[0] === c.MINI_STR_PREFIX || entry.rawValue[0] === c.EXPR_STR_PREFIX) {
		return entry.rawValue.substring(1);
	}
	return `${entry.rawValue}`;
}

export function buildBoxDisplay(entry: Entry): BoxDisplay {
	return {
		displayName: entryToFuncName(entry),
		displayValue: getDisplayValue(entry),
	};
}

export function entryToBox(entry: Entry, id: Array<number> = []): Box {
	const entryData = <EntryData>entry;
	const boxTyping = buildBoxTyping(entry);
	const boxDisplay = buildBoxDisplay(entry);

	const paddings: Array<number> = [];
	const widths: Array<number> = [];
	const lastSiblingIds: Array<string> = [];
	let groupId = -1;

	const children = entry.children
		.map((child, i) => entryToBox(child, id.concat(i)))
		.map((child) => {
			const _child = child;

			if (child.rawName[0] === c.CHAINED_FUNC_PREFIX && groupId !== -1) {
				if (child.padding > paddings[groupId]) {
					paddings[groupId] = child.padding;
				}
				if (child.width > widths[groupId]) {
					widths[groupId] = child.width;
				}
			} else {
				groupId += 1;
				paddings[groupId] = child.padding;
				widths[groupId] = child.width;
				_child.error = child.rawName[0] === c.CHAINED_FUNC_PREFIX && groupId === 0;
			}
			lastSiblingIds[groupId] = child.id;

			_child.groupId = groupId;
			return _child;
		}).map((child) => {
			const _child = child;
			_child.padding = child.type === EntryType.Value ? 1 : paddings[child.groupId];
			_child.width = paddings[child.groupId] + widths[child.groupId];
			_child.lastSiblingId = lastSiblingIds[child.groupId];
			return _child;
		});

	return {
		...entryData,
		...boxTyping,
		...boxDisplay,

		padding: boxDisplay.displayName.length + 1,
		width: boxDisplay.displayValue.length + (boxTyping.valueType === ValueType.Null ? 1 : 0),

		id: id.join('-'),
		groupId: 0,
		lastSiblingId: '',

		children,
	};
}

export default entryToBox;
