import * as c from '../constants';
import { ExporterError } from '../errors';
import { Entry } from '../model';

enum EntryType {
	Value,
	Function,
	MininotationFunction,
	ChainedFunction,
	LambdaFunction,
	Object,
	List,
	ConstantDef,
}

/**
 * Serialise an object to JSON.
 * @param thing the object to serialize
 * @returns a string reprensenting the object in JSON
 */
export function serialize(thing: unknown): string {
	return JSON.stringify(thing);
}

export function rawNameToFuncName(rawName: string): string {
	if (rawName === '') {
		throw new ExporterError('can not get func name from empty raw name');
	}
	if (rawName[0] === c.CHAINED_FUNC_PREFIX || rawName[0] === c.CONSTANT_DEF_PREFIX) {
		return rawName.substring(1);
	}
	if (rawName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		return rawName.substring(0, rawName.length - 1);
	}
	return rawName;
}

/**
 * Convert a Jaffle string into JavaScript code, handling prefixes (`_`, `=`, `/`).
 * @param rawValue the string to convert
 * @returns a string of Javascript code coming from the string
 */
export function rawValueToJs(rawValue: string): string {
	const isPrefixed = rawValue[0] === c.MINI_STR_PREFIX || rawValue[0] === c.EXPR_STR_PREFIX;
	const newStr = (isPrefixed ? rawValue.substring(1) : rawValue).trim();
	const quote = newStr.includes('\n') ? '`' : "'";
	let js: string;

	if (!Number.isNaN(Number(rawValue)) || rawValue === ''
		|| rawValue === 'true' || rawValue === 'false') {
		js = rawValue;
	} else if (rawValue[0] === c.EXPR_STR_PREFIX) {
		if (newStr.match(/[^a-zA-Z0-9.+\-*/() ]/g)) {
			throw new ExporterError(`Not a valid expression string: ${newStr}`);
		}
		js = newStr.replace(/[a-z][a-zA-Z0-9]*/g, `${c.VAR_NAME_PREFIX}$&`);
	} else {
		js = `${quote}${newStr}${quote}`;
		js = rawValue[0] === c.MINI_STR_PREFIX ? `mini(${js})` : js;
	}
	return js;
}

/**
 * Convert a list of Jaffle lambda function parameter names into Javascript code (ie. "x => x").
 * @param params the parameter names coming from a Jaffle lambda function
 * @returns a string of Javascript code used to prefix a call to a lambda function
 */
export function lambdaEntryToJs(params: Array<string>): string {
	params.forEach((param) => {
		if (typeof param !== 'string') {
			throw new ExporterError('lambda parameters must be strings');
		}
		if (param.match(/^[a-z][a-zA-Z0-9_]*$/g) === null) {
			throw new ExporterError('invalid lambda parameter name');
		}
	});

	if (params.length === 0) {
		return `${c.LAMBDA_VAR} => ${c.LAMBDA_VAR}`;
	}
	const varsJs = params.map((varName) => c.VAR_NAME_PREFIX + varName).join(', ');
	return `(${c.LAMBDA_VAR}, ${varsJs}) => ${c.LAMBDA_VAR}`;
}

export function entryToEntryType(entry: Entry): EntryType {
	if (entry.rawName === '' && entry.rawValue === '') {
		return EntryType.List;
	}
	if (entry.rawName === '') {
		return EntryType.Value;
	}
	if (entry.rawName[0] === c.CHAINED_FUNC_PREFIX) {
		return EntryType.ChainedFunction;
	}
	if (entry.rawName[0] === c.MINI_STR_PREFIX) {
		return EntryType.MininotationFunction;
	}
	if (entry.rawName[0] === entry.rawName[0].toUpperCase()) {
		return EntryType.Object;
	}
	if (entry.rawName === c.LAMBDA_NAME) {
		return EntryType.LambdaFunction;
	}
	if (entry.rawName[0] === c.CONSTANT_DEF_PREFIX) {
		return EntryType.ConstantDef;
	}
	return EntryType.Function;
}

/**
 * Convert a Jaffle function into Javascript code.
 * @param entry The Jaffle function to convert
 * @returns a string of JavaScript code which calls the function
 */
export function functionEntryToJs(entry: Entry): string {
	const funcName = rawNameToFuncName(entry.rawName);
	let js: string;
	const isVarDef = entry.rawName[0] === c.CONSTANT_DEF_PREFIX;

	if (entry.rawName[0] === entry.rawName[0].toUpperCase()) {
		js = entry.rawName[0].toLowerCase() + entry.rawName.substring(1);
	} else if (entry.rawValue === '') {
		js = `${funcName}()`;
	} else if (entry.rawName === c.LAMBDA_NAME) {
		js = lambdaEntryToJs(entry.rawValue.split(','));
	} else {
		const serializSuffix = entry.rawName.split(c.SERIALIZE_FUNC_SUFFIX)[1];
		// eslint-disable-next-line no-use-before-define
		const paramsJs = paramsToJsGroups(entry.children, serializSuffix).join(', ');
		if (isVarDef) {
			js = `const ${c.VAR_NAME_PREFIX}${funcName} = ${paramsJs}`;
		} else {
			js = `${funcName}(${paramsJs})`;
		}
	}

	return js;
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

	params.forEach((entry) => {
		if (serializedParamId === -2 || serializedParamId === groups.length) {
			groups.push([entry]);
			return;
		}

		if (entry.rawName === '') {
			groups.push([entry]);
			onMainFunc = false;
			return;
		}

		if (entry.rawName[0] === c.CHAINED_FUNC_PREFIX) {
			if (groups.length === 0) {
				throw new ExporterError('chained function as first entry');
			}
			if (!onMainFunc) {
				throw new ExporterError('orphan chained function');
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
 * @param serializSuffix the serialization suffix, coming after the `^` sign,
 * which can be undefined, an empty string, or a string representing the parameter id
 * @returns a list of strings of Javascript code, each for one group, which list their parameters.
 */
export function paramsToJsGroups(params: Array<Entry>, serializSuffix?: string): Array<string> {
	if (params.length === 0) {
		return [];
	}

	let serializedParamId = -1;
	if (serializSuffix !== undefined) {
		serializedParamId = serializSuffix === '' ? -2 : parseInt(serializSuffix, 10) - 1;
	}

	const groups = groupFuncParams(params, serializedParamId);
	if (serializedParamId >= groups.length) {
		throw new ExporterError('param identifier out of range');
	}

	return groups
		.map((group, id) => (group
			.map((param) => (
				// eslint-disable-next-line no-use-before-define
				[id, -2].includes(serializedParamId) ? serialize(param) : entryToJs(param)
			))
			.join('.')
		));
}

/**
 * Convert a Jaffle list into JavaScript code.
 * @param list the list to convert
 * @returns a string of JavaScript code which declares an array containing the list elements
 */
export function listEntryToJs(list: Entry): string {
	// eslint-disable-next-line no-use-before-define
	return `[${list.children.map((item) => entryToJs(item)).join(', ')}]`;
}

export function entryToJs(entry: Entry): string {
	return entry.rawName === '' ? rawValueToJs(entry.rawValue) : functionEntryToJs(entry);
}

export function rootEntryToJs(entry: Entry): string {
	let outputJs = '';

	if (entry.children.length === 0) {
		throw new ExporterError('document must contain at least one function');
	}
	const groups = paramsToJsGroups(entry.children);
	const tuneMain = groups.pop();
	outputJs += groups.map((group) => `${group};\n`).join('');
	outputJs += `return ${tuneMain};`;

	return outputJs;
}

export default rootEntryToJs;
