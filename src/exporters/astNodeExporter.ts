import { AstNodeData, AstNode, BoxType, Entry } from '../model';
import * as c from '../constants';

export function rawNameToBoxType(rawName: string): BoxType {
	const prefix = rawName[0];
	let boxType: BoxType;
	if (prefix === c.CHAINED_FUNC_PREFIX) {
		boxType = BoxType.ChainedFunc;
	} else if (prefix === c.CONSTANT_DEF_PREFIX) {
		boxType = BoxType.ConstantDef;
	} else if (rawName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		boxType = BoxType.SerializedData;
	} else if (rawName === '') {
		boxType = BoxType.Value;
	} else {
		boxType = BoxType.MainFunc;
	}
	// boxType = BoxType.List; // ??
	return boxType;
}

export function rawValueToValue(rawValue: string): unknown {
	let value: unknown;

	if (rawValue === '') {
		value = null;
	} else if (!Number.isNaN(Number(rawValue))) {
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

export function entryToAstNodeData(entry: Entry): AstNodeData {
	const type = rawNameToBoxType(entry.rawName);
	const value = rawValueToValue(entry.rawValue);

	return {
		type,
		value: type === BoxType.Value ? value : entry.rawName,
	};
}

export function entryToAstNode(entry: Entry): AstNode {
	const astNodeData = entryToAstNodeData(entry);
	if (astNodeData.type === BoxType.Value) {
		return {
			...astNodeData,
			children: [],
		};
	}

	return {
		...astNodeData,
		children: [{
			value: rawValueToValue(entry.rawValue),
			type: BoxType.Value,
			children: entry.children.map((child) => entryToAstNode(child)),
		}],
	};
}

export default entryToAstNode;
