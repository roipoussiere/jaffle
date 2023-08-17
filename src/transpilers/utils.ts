import { Entry, EntryType } from '../model';
import * as c from '../constants';

export function entryToEntryType(entry: Entry): EntryType {
	if (entry.rawName === '' && entry.rawValue === '') {
		return EntryType.List;
	}
	if (entry.rawName[0] === c.CONSTANT_DEF_PREFIX) {
		return EntryType.ConstantDef;
	}
	if (entry.rawName === '') {
		if (entry.rawValue[0] === c.MINI_STR_PREFIX) {
			return EntryType.MininotationFunction;
		}
		if (entry.rawValue[0] === c.EXPR_STR_PREFIX) {
			return EntryType.ExpressionFunction;
		}
		return EntryType.Value;
	}
	if (entry.rawName[0] === c.CHAINED_FUNC_PREFIX) {
		return EntryType.ChainedFunction;
	}
	// if (entry.rawName[0] === entry.rawName[0].toUpperCase()) {
	// 	return EntryType.Object;
	// }
	if (entry.rawName === c.LAMBDA_NAME) {
		return EntryType.LambdaFunction;
	}
	return EntryType.Function;
}

export function entryToFuncName(entry: Entry): string {
	if (entry.rawName === '') {
		return '';
	}

	let funcName = entry.rawName;
	if (funcName[0] === c.CHAINED_FUNC_PREFIX
			|| funcName[0] === c.CONSTANT_DEF_PREFIX
			|| funcName[0] === c.DICT_PREFIX) {
		funcName = funcName.substring(1);
	}
	if (funcName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		funcName = funcName.substring(0, funcName.length - 1);
	}
	// if (funcName[0] === funcName[0].toUpperCase()) {
	// 	return funcName[0].toLowerCase() + funcName.substring(1);
	// }
	return funcName;
}

export function entryToString(entry: Entry, indentLvl = 1): string {
	const keyVal = `'${entry.rawName}': '${entry.rawValue}'`.replace(/\n/g, ' ').substring(0, 50);
	const childrenStr = entry.children.map(
		(child) => `\n${'  '.repeat(indentLvl)}${entryToString(child, indentLvl + 1)}`,
	);

	return `${keyVal}${childrenStr.join('')}`;
}
