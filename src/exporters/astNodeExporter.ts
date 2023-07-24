import { AstNode, BoxType, Entry } from '../model';
import * as c from '../constants';

export function getBoxType(rawName: string): BoxType {
	const prefix = rawName[0];
	let boxType: BoxType;
	if (prefix === c.CHAINED_FUNC_PREFIX) {
		boxType = BoxType.ChainedFunc;
	} else if (prefix === c.CONST_FUNC_PREFIX) {
		boxType = BoxType.ConstantDef;
	} else if (rawName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		boxType = BoxType.SerializedData;
	} else if (rawName === '') {
		boxType = BoxType.Value;
	} else {
		boxType = BoxType.MainFunc;
	}
	return boxType;
}

export function getValue(rawValue: string): unknown {
	let value: unknown;

	if (rawValue === '') {
		value = null;
	} else if (!Number.isNaN(rawValue)) {
		value = Number(rawValue);
	} else if (rawValue === 'true') {
		value = true;
	} else if (rawValue === 'false') {
		value = false;
	} else {
		value = rawValue;
	}
	return value;
}

export function entryToAstNode(entry: Entry): AstNode {
	return {
		type: getBoxType(entry.rawName),
		value: getValue(entry.rawValue),
		children: entry.children.map((child) => entryToAstNode(child)),
	};
}

export default entryToAstNode;
