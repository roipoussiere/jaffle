import * as c from '../../constants';
import { ExporterError } from '../../errors';
import { Entry, EntryType } from '../../model';
import { entryToEntryType, entryToFuncName } from '../utils';

export function indent(indentLevel: number): string {
	return '\t'.repeat(indentLevel);
}

export function getEntryName(entry: Entry) {
	return entry.rawName.split(c.DICT_PREFIX).reverse()[0];
}

export function serializedRawValueToJs(rawValue: string): string {
	if (rawValue === '') {
		return 'null';
	}
	if (!Number.isNaN(Number(rawValue)) || rawValue === 'true' || rawValue === 'false') {
		return rawValue;
	}
	return `'${rawValue}'`;
}

export function serializedListToJs(entries: Array<Entry>, iLvl = 0): string {
	const innerJs = entries
		// eslint-disable-next-line no-use-before-define
		.map((ch) => `\n${indent(iLvl)}${serializedEntryToJs(ch, iLvl + 1)}`)
		.join(',');
	return `[${innerJs}\n${indent(iLvl === 0 ? 0 : iLvl - 1)}]`;
}

export function serializedDictToJs(entries: Array<Entry>, iLvl = 0): string {
	const jsEntries = entries.map((child) => {
		let jsValue: string;
		if (child.children.length === 0) {
			jsValue = serializedRawValueToJs(child.rawValue);
		} else if (child.children.length === 1 || child.children[0].rawName[0] === c.DICT_PREFIX) {
			jsValue = serializedDictToJs(child.children, iLvl + 1);
		} else {
			jsValue = serializedListToJs(child.children, iLvl + 1);
		}
		return `\n${indent(iLvl)}'${getEntryName(child)}': ${jsValue}`;
	});

	return `{${jsEntries.join(',')}\n${indent(iLvl === 0 ? 0 : iLvl - 1)}}`;
}

/**
 * Serialise an object to JSON.
 * @param entry the object to serialize
 * @returns a string reprensenting the object in JSON
 */
export function serializedEntryToJs(entry: Entry, iLvl = 0): string {
	if (entry.children.length === 0) {
		const jsValue = serializedRawValueToJs(entry.rawValue);
		return entry.rawName === '' ? jsValue : `{ '${getEntryName(entry)}': ${jsValue} }`;
	}

	if (entry.children[0].rawName[0] === c.DICT_PREFIX) {
		const jsValue = serializedDictToJs(entry.children, iLvl + 1);
		return entry.rawName === '' ? jsValue
			: `{\n${indent(iLvl)}'${getEntryName(entry)}': ${jsValue}}`;
	}

	const jsValue = serializedListToJs(entry.children, iLvl + 1);
	return entry.rawName === ''
		? `\n${jsValue}`
		: `{\n${indent(iLvl)}'${entry.rawName}': ${jsValue}}`;
}

/**
 * Convert a Jaffle string into JavaScript code, handling prefixes (`_`, `=`, `/`).
 * @param rawValue the string to convert
 * @returns a string of Javascript code coming from the string
 */
export function rawValueToJs(rawValue: string): string {
	const quote = rawValue.includes('\n') ? '`' : "'";

	if (!Number.isNaN(Number(rawValue)) || rawValue === ''
		|| rawValue === 'true' || rawValue === 'false') {
		return rawValue;
	}

	if (rawValue[0] === c.EXPR_STR_PREFIX) {
		const newStr = rawValue.substring(1).trim();
		if (newStr.match(/[^a-zA-Z0-9.+\-*/() ]/g)) {
			throw new ExporterError(`Not a valid expression string: ${rawValue}`);
		}
		return newStr.replace(/[a-z][a-zA-Z0-9]*/g, `${c.VAR_NAME_PREFIX}$&`);
	}

	return `${quote}${rawValue}${quote}`;
}

/**
 * Convert a list of Jaffle lambda function parameter names into Javascript code (ie. "x => x").
 * @param strLambdaParams the parameter names coming from a Jaffle lambda function
 * @returns a string of Javascript code used to prefix a call to a lambda function
 */
export function lambdaParamsToJs(strLambdaParams: string): string {
	if (strLambdaParams === '') {
		return `${c.LAMBDA_VAR} => ${c.LAMBDA_VAR}`;
	}

	const lambdaParams = strLambdaParams.split(',');

	lambdaParams.forEach((param) => {
		if (param.match(/^[a-z][a-zA-Z0-9_]*$/g) === null) {
			throw new ExporterError('invalid lambda parameter name');
		}
	});

	const varsJs = lambdaParams.map((varName) => c.VAR_NAME_PREFIX + varName).join(', ');
	return `(${c.LAMBDA_VAR}, ${varsJs}) => ${c.LAMBDA_VAR}`;
}

export function expandEntry(entry: Entry): Entry {
	if (entry.rawValue[0] === c.MINI_STR_PREFIX) {
		const miniChild = {
			rawName: 'mini',
			rawValue: '',
			children: [{
				rawName: '',
				rawValue: entry.rawValue.substring(1),
				children: [],
			}],
		};

		return entry.rawName === '' ? miniChild : {
			rawName: entry.rawName,
			rawValue: '',
			children: [miniChild],
		};
	}

	if (entry.rawName === '' || entry.rawValue === '' || entry.rawName === 'set') {
		return entry;
	}

	return {
		rawName: entry.rawName,
		rawValue: '',
		children: [{
			rawName: '',
			rawValue: entry.rawValue,
			children: [],
		}],
	};
}

/**
 * Convert a Jaffle function into Javascript code.
 * @param entry The Jaffle function to convert
 * @returns a string of JavaScript code which calls the function
 */
export function childEntryToJs(_entry: Entry, iLvl = 0): string {
	const entry = expandEntry(_entry);
	const entryType = entryToEntryType(entry);

	if (entryType === EntryType.Value || entryType === EntryType.ExpressionFunction) {
		return rawValueToJs(entry.rawValue);
	}

	if (entryType === EntryType.List) {
		const listJs = entry.children.map((item) => childEntryToJs(item, iLvl + 1));
		return `[${listJs.join(`,\n${indent(iLvl)}`)}]`;
	}

	const funcName = entryToFuncName(entry);

	if (entryType === EntryType.LambdaFunction) {
		return lambdaParamsToJs(entry.rawValue);
	}

	const serializeSuffix = entry.rawName.split(c.SERIALIZE_FUNC_SUFFIX)[1];
	// eslint-disable-next-line no-use-before-define
	const jsGroups = paramsToJsGroups(entry.children, serializeSuffix, iLvl);

	if (entryType === EntryType.ConstantDef) {
		return `const ${c.VAR_NAME_PREFIX}${funcName} = ${jsGroups[0]}`;
	}

	if (funcName[0] === funcName[0].toUpperCase()) {
		return funcName[0].toLowerCase() + funcName.substring(1);
	}

	const areValues = serializeSuffix === undefined
		&& entry.children.filter((child) => child.rawName === '').length === entry.children.length;
	const lineBreak = areValues ? '' : `\n${indent(iLvl)}`;
	const paramLineBreak = areValues ? ' ' : `\n\n${indent(iLvl)}`;

	return `${funcName}(${lineBreak}${jsGroups.join(`,${paramLineBreak}`)})`;
}

/**
 * Split a list of functions into several groups, each containing one main function and eventually
 * one or more chained functions.
 * @param params the list of functions to group
 * @param serializedParamId the id of a parameter to serialize
 * (-1 to disable serialization, -2 to serialize all parameters)
 * @returns an array of lists of functions
 */
export function groupFuncParams(params: Array<Entry>, serializedParamId = -1): Array<Array<Entry>> {
	if (params.length === 0) {
		throw new ExporterError('group of params is empty');
	}

	const groups: Array<Array<Entry>> = [];
	let onMainFunc = false;

	params.forEach((_entry, id) => {
		if (serializedParamId === -2 || serializedParamId === id) {
			groups.push([_entry]);
			return;
		}

		const entry = expandEntry(_entry);
		const entryType = entryToEntryType(entry);

		if (entryType === EntryType.Value || entryType === EntryType.List) {
			groups.push([entry]);
			onMainFunc = false;
			return;
		}

		if (entryType === EntryType.ChainedFunction) {
			if (groups.length === 0 || !onMainFunc) {
				throw new ExporterError('chained function must follow a function');
			}
			groups[groups.length - 1].push(entry);
		} else {
			groups.push([entry]);
			onMainFunc = true;
		}
	});

	return groups;
}

/**
 * convert Jaffle function parameters into several groups, converted into Javascript code.
 * @param params a list of Jaffle function parameters
 * @param serializeSuffix the serialization suffix, coming after the `^` sign,
 * which can be undefined, an empty string, or a string representing the parameter id
 * @returns a list of strings of Javascript code, each for one group, which list their parameters.
 */
export function
paramsToJsGroups(params: Array<Entry>, serializeSuffix?: string, iLvl = 0): Array<string> {
	if (params.length === 0) {
		return [];
	}

	let serializedParamId = -1;
	if (serializeSuffix !== undefined) {
		serializedParamId = serializeSuffix === '' ? -2 : parseInt(serializeSuffix, 10) - 1;
	}

	const groups = groupFuncParams(params, serializedParamId);
	if (serializedParamId >= groups.length) {
		throw new ExporterError('param identifier out of range');
	}

	if (serializedParamId === -2 && groups[0][0].rawName[0] === c.DICT_PREFIX) {
		return [serializedDictToJs(groups.map((group) => group[0]), iLvl + 1)];
	}

	return groups.map((group, id) => (id === serializedParamId || serializedParamId === -2
		? serializedEntryToJs(group[0], iLvl)
		: group.map((param) => childEntryToJs(param, iLvl + 1)).join(`\n${indent(iLvl)}.`)
	));
}

export function entryToJs(entry: Entry): string {
	let outputJs = '';

	if (entry.children.length === 0) {
		throw new ExporterError('document must contain at least one function');
	}
	const groups = paramsToJsGroups(entry.children);
	const tuneMain = groups.pop();
	outputJs += groups.map((group) => `${group};\n\n`).join('');
	outputJs += `return ${tuneMain};`;

	return outputJs;
}

export default entryToJs;
