import * as c from '../constants';
import { ExporterError } from '../errors';
import { Entry } from '../model';

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
 * Convert an object to a Jaffle function.
 * @param thing the object to convert
 * @returns the object converted into a function
 */
// export function toJaffleFunction(thing: JaffleAny): JaffleFunction {
// 	if (typeof thing === 'string') {
// 		if (thing[0] === c.MINI_STR_PREFIX) {
// 			return { mini: thing.substring(1) };
// 		}
// 		if (thing[0] === c.EXPR_STR_PREFIX) {
// 			return { expr: thing.substring(1) };
// 		}
// 	}
// 	if (isFunction(thing)) {
// 		const func = <JaffleFunction>thing;
// 		if (Object.keys(func).length === 0) {
// 			throw new ExporterError('function is empty');
// 		}
// 		return func;
// 	}
// 	throw new ExporterError('Not a function');
// }

/**
 * Return the parameters of an object, supposed to come from a Jaffle function.
 * @param thing the object whose parameters to get
 * @returns a list of parameters from the object
 */
// export function getJaffleFuncParams(thing: JaffleAny): JaffleList {
// 	let params: JaffleList;
// 	if (!(thing instanceof Object)) {
// 		params = [thing];
// 	} else {
// 		params = thing instanceof Array ? thing : [thing];
// 	}
// 	if (params.length === 1 && params[0] === null) {
// 		params = [];
// 	}
// 	return params;
// }

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
	let func: Entry;

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

		const funcName = rawNameToFuncName(func.rawName);
		if (funcName[0] === c.CHAINED_FUNC_PREFIX) {
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
 * Convert a Jaffle string into JavaScript code, handling prefixes (`_`, `=`, `/`).
 * @param rawValue the string to convert
 * @returns a string of Javascript code coming from the string
 */
export function rawValueToJs(rawValue: string): string {
	const isPrefixed = [c.MINI_STR_PREFIX, c.EXPR_STR_PREFIX].includes(rawValue[0]);
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
 * Convert a list of Jaffle lambda function parameter names into Javascript code (ie. "x => x").
 * @param params the parameter names coming from a Jaffle lambda function
 * @returns a string of Javascript code used to prefix a call to a lambda function
 */
export function jaffleLambdaToJs(params: Array<string>): string {
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

/**
 * Convert a Jaffle function into Javascript code.
 * @param func The Jaffle function to convert
 * @returns a string of JavaScript code which calls the function
 */
export function functionEntryToJs(func: Entry): string {
	const funcName = rawNameToFuncName(func.rawName);
	const funcSuffix = func.rawName.split(c.SERIALIZE_FUNC_SUFFIX)[1];
	let js: string;
	const isVarDef = func.rawName[0] === c.CONSTANT_DEF_PREFIX;

	if (func.rawName[0] === func.rawName[0].toUpperCase()) {
		js = func.rawName[0].toLowerCase() + func.rawName.substring(1);
	} else if (func.rawValue === '') {
		js = `${funcName}()`;
	} else if (func.rawName === c.LAMBDA_NAME) {
		js = jaffleLambdaToJs(func.rawValue.split(','));
	} else {
		const paramsJs = paramsToJsGroups(func.children, funcSuffix[1]).join(', ');
		if (isVarDef) {
			js = `const ${c.VAR_NAME_PREFIX}${funcName} = ${paramsJs}`;
		} else {
			js = `${funcName}(${paramsJs})`;
		}
	}

	return js;
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
