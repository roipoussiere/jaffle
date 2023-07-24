import { Entry, Box, BoxType, ValueType, BoxTyping, EntryData, BoxDisplay }
	from '../model';
import * as c from '../constants';

export function getBoxType(rawName: string): BoxType {
	let vBoxType: BoxType;
	if (rawName === '') {
		vBoxType = BoxType.Value;
	} else if (rawName[0] === c.CHAINED_FUNC_PREFIX) {
		vBoxType = BoxType.ChainedFunc;
	} else if (rawName[0] === c.CONSTANT_DEF_PREFIX) {
		vBoxType = BoxType.ConstantDef;
	} else if (rawName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		vBoxType = BoxType.SerializedData;
	// } else if () {
	// 	vBoxType = VBoxType.List;
	} else {
		vBoxType = BoxType.MainFunc;
	}
	return vBoxType;
}

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
		type: getBoxType(entry.rawName),
		valueType: getValueType(entry),
	};
}

export function getDisplayName(entry: Entry) {
	if (entry.rawName[0] === c.CHAINED_FUNC_PREFIX || entry.rawName[0] === c.CONSTANT_DEF_PREFIX) {
		return entry.rawName.substring(1);
	}
	if (entry.rawName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		return entry.rawName.substring(0, entry.rawName.length - 1);
	}
	return entry.rawName;
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
		displayName: getDisplayName(entry),
		displayValue: getDisplayValue(entry),
	};
}

export function entryToBox(entry: Entry, funcId: Array<number> = [], groupId = 0): Box {
	let paramsGroupId = -1;

	const entryData = <EntryData>entry;
	const boxTyping = buildBoxTyping(entry);
	const boxDisplay = buildBoxDisplay(entry);

	// TODO
	const padding = boxDisplay.displayName.length + 1;
	const width = boxDisplay.displayName.length + boxDisplay.displayValue.length + 1;

	return {
		...entryData,
		...boxTyping,
		...boxDisplay,

		padding,
		width,

		id: funcId.join('-'),
		groupId,

		// const children = box.children.length <= 1 ? [] : box.children.map((child, i) => {
		children: entry.children.map((child, i) => {
			if (child.rawName[0] === c.CHAINED_FUNC_PREFIX || paramsGroupId === -1) {
				paramsGroupId += 1;
			}
			return entryToBox(
				child,
				funcId.concat(i),
				paramsGroupId,
			);
		}),
	};
}

export default entryToBox;
