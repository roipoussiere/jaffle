import { Entry, Box, BoxType, ValueType, BoxTyping, BoxGeometry, EntryData, BoxDisplay }
	from '../model';
import * as c from '../constants';

export function getBoxType(rawName: string): BoxType {
	let vBoxType: BoxType;
	if (rawName === '') {
		vBoxType = BoxType.Value;
	} else if (rawName[0] === c.CHAINED_FUNC_PREFIX) {
		vBoxType = BoxType.ChainedFunc;
	} else if (rawName[0] === c.CONST_FUNC_PREFIX) {
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

export function getValueType(rawValue: string, specialString = true): ValueType {
	let boxValueType: ValueType;
	if (specialString && rawValue[0] === c.MINI_STR_PREFIX) {
		boxValueType = ValueType.Mininotation;
	} else if (specialString && rawValue[0] === c.EXPR_STR_PREFIX) {
		boxValueType = ValueType.Expression;
	} else if (!Number.isNaN(rawValue)) {
		boxValueType = ValueType.Number;
	} else if (rawValue === 'true' || rawValue === 'false') {
		boxValueType = ValueType.Boolean;
	} else if (rawValue === '') {
		boxValueType = ValueType.Null;
	} else {
		boxValueType = ValueType.String;
	}
	return boxValueType;
}

export function buildBoxTyping(entryData: EntryData): BoxTyping {
	return {
		type: getBoxType(entryData.rawName),
		valueType: getValueType(entryData.rawValue),
	};
}

export function buildBoxDisplay(entryData: EntryData): BoxDisplay {
	return {
		displayName: entryData.rawName, // TODO
		displayValue: `${entryData.rawValue}`, // TODO
	};
}

export function buildBoxGeometry(
	boxTyping: BoxTyping,
	boxDisplay: BoxDisplay,
	displayNameMaxLen: number,
	displayMaxLen: number,
): BoxGeometry {
	// const noSpace = boxTyping.type === BoxType.Value || boxTyping.valueType === ValueType.Null;
	// const contentWidth = boxDisplay.displayName.length + boxDisplay.displayValue.length
	// 	+ (noSpace ? 0 : 1);

	return {
		padding: displayNameMaxLen + 1,
		width: displayMaxLen,
	};
}

export function entryToBox(entry: Entry, funcId: Array<number> = [], groupId = 0): Box {
	let paramsGroupId = -1;

	const entryData = <EntryData>entry;
	const boxTyping = buildBoxTyping(entryData);
	const boxDisplay = buildBoxDisplay(entryData);
	const displayNameMaxLen = boxDisplay.displayName.length; // TODO
	const displayMaxLen = boxDisplay.displayName.length + boxDisplay.displayValue.length; // TODO
	const boxGeometry = buildBoxGeometry(boxTyping, boxDisplay, displayNameMaxLen, displayMaxLen);

	return {
		...entryData,
		...boxTyping,
		...boxDisplay,
		...boxGeometry,

		id: funcId.join('-'),
		groupId,

		// const children = box.children.length <= 1 ? [] : box.children.map((child, i) => {
		children: entry.children.map((child, i) => {
			if (child.rawName[0] === c.CHAINED_FUNC_PREFIX) {
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
