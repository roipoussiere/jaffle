import { load as loadYaml } from 'js-yaml';
import * as c from '../constants';

import { ExporterError } from '../errors';

type JaffleLiteral = string | number | null;
// eslint-disable-next-line no-use-before-define
type JaffleAny = JaffleLiteral | JaffleFunction | JaffleList
type JaffleList = Array<JaffleAny>
type JaffleFunction = { [funcName: string]: JaffleAny }

/**
 * Serialise an object to JSON.
 * @param thing the object to serialize
 * @returns a string reprensenting the object in JSON
 */
export function serialize(thing: unknown): string {
	return JSON.stringify(thing);
}

/**
 * Check if the passed object is a Jaffle function.
 * @param thing the object to test
 * @returns true if the object is a Jaffle function, false otherwise
 */
export function isJaffleFunction(thing: JaffleAny): boolean {
	return thing instanceof Object && !(thing instanceof Array);
}

/**
 * Returns the Jaffle function name.
 * @param func the function whose name to get
 * @returns the name of the function
 */
export function getJaffleFuncName(func: JaffleFunction): string {
	const keys = Object.keys(func);
	if (keys.length === 0) {
		throw new ExporterError('could not find function name');
	}
	if (keys.length > 1) {
		throw new ExporterError(`too many function names: ${keys.join(', ')}`);
	}
	return keys[0];
}

/**
 * Convert an object to a Jaffle function.
 * @param thing the object to convert
 * @returns the object converted into a function
 */
export function toJaffleFunction(thing: JaffleAny): JaffleFunction {
	if (typeof thing === 'string') {
		if (thing[0] === c.MINI_STR_PREFIX) {
			return { mini: thing.substring(1) };
		}
		if (thing[0] === c.EXPR_STR_PREFIX) {
			return { expr: thing.substring(1) };
		}
	}
	if (isJaffleFunction(thing)) {
		const func = <JaffleFunction>thing;
		if (Object.keys(func).length === 0) {
			throw new ExporterError('function is empty');
		}
		return func;
	}
	throw new ExporterError('Not a function');
}

/**
 * Return the parameters of an object, supposed to come from a Jaffle function.
 * @param thing the object whose parameters to get
 * @returns a list of parameters from the object
 */
export function getJaffleFuncParams(thing: JaffleAny): JaffleList {
	let params: JaffleList;
	if (!(thing instanceof Object)) {
		params = [thing];
	} else {
		params = thing instanceof Array ? thing : [thing];
	}
	if (params.length === 1 && params[0] === null) {
		params = [];
	}
	return params;
}

/**
 * Split a list of functions into several groups, each containing one main function and eventually
 * one or more chained functions.
 * @param list the list of functions to group
 * @param serializedParamId the id of a parameter to serialize
 * (-1 to disable serialization, -2 to serialize all parameters)
 * @returns an array of lists of functions
 */
export function groupJaffleFuncParams(list: JaffleList, serializedParamId = -1): Array<JaffleList> {
	if (list.length === 0) {
		throw new ExporterError('group of params is empty');
	}
	const groups: Array<JaffleList> = [];
	let onMainFunc = false;
	let func: JaffleFunction;

	list.forEach((item) => {
		if ([groups.length, -2].includes(serializedParamId)) {
			groups.push([item]);
			return;
		}

		try {
			func = toJaffleFunction(item);
		} catch {
			groups.push([item]);
			onMainFunc = false;
			return;
		}

		const funcName = getJaffleFuncName(func);
		if (funcName[0] === c.CHAINED_FUNC_PREFIX) {
			if (groups.length === 0) {
				throw new ExporterError('chained function as first entry');
			}
			if (!onMainFunc) {
				throw new ExporterError('orphan chained function');
			}
			groups[groups.length - 1].push(item);
		} else {
			groups.push([item]);
			onMainFunc = true;
		}
	});

	return groups;
}

/**
 * Convert a Jaffle string into JavaScript code, handling prefixes (`_`, `=`, `/`).
 * @param str the string to convert
 * @returns a string of Javascript code coming from the string
 */
export function stringValueToJs(str: string): string {
	const isPrefixed = [c.MINI_STR_PREFIX, c.EXPR_STR_PREFIX].includes(str[0]);
	const newStr = (isPrefixed ? str.substring(1) : str).trim();
	const quote = newStr.includes('\n') ? '`' : "'";
	let js: string;

	if (str[0] === c.EXPR_STR_PREFIX) {
		if (newStr.match(/[^a-zA-Z0-9.+\-*/() ]/g)) {
			throw new ExporterError(`Not a valid expression string: ${newStr}`);
		}
		js = newStr.replace(/[a-z][a-zA-Z0-9]*/g, `${c.VAR_NAME_PREFIX}$&`);
	} else {
		js = `${quote}${newStr}${quote}`;
		js = str[0] === c.MINI_STR_PREFIX ? `mini(${js})` : js;
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
export function jaffleParamsToJsGroups(params: JaffleList, serializSuffix?: string): Array<string> {
	if (params.length === 0) {
		return [];
	}

	let serializedParamId = -1;
	if (serializSuffix !== undefined) {
		serializedParamId = serializSuffix === '' ? -2 : parseInt(serializSuffix, 10) - 1;
	}

	const groups = groupJaffleFuncParams(params, serializedParamId);
	if (serializedParamId >= groups.length) {
		throw new ExporterError('param identifier out of range');
	}

	return groups
		.map((group, id) => (group
			.map((param) => (
				// eslint-disable-next-line no-use-before-define
				[id, -2].includes(serializedParamId) ? serialize(param) : jaffleParamToJs(param)
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
export function jaffleFuncToJs(func: JaffleFunction): string {
	if (Object.keys(func).length === 0) {
		throw new ExporterError('Function is empty');
	}

	const funcName = getJaffleFuncName(func);
	const fNameAndSuffix = funcName.split(c.SERIALIZE_FUNC_SUFFIX);
	let [newFuncName] = fNameAndSuffix;
	let js: string;
	const isVarDef = newFuncName[0] === c.CONSTANT_DEF_PREFIX;

	newFuncName = [c.CHAINED_FUNC_PREFIX, c.CONSTANT_DEF_PREFIX].includes(newFuncName[0])
		? newFuncName.substring(1) : newFuncName;

	if (newFuncName[0] === newFuncName[0].toUpperCase()) {
		js = newFuncName[0].toLowerCase() + newFuncName.substring(1);
	} else {
		const params = getJaffleFuncParams(func[funcName]);

		if (funcName === c.LAMBDA_NAME) {
			js = jaffleLambdaToJs(<Array<string>>params);
		} else if (params.length === 0) {
			js = `${newFuncName}()`;
		} else {
			const paramsJs = jaffleParamsToJsGroups(params, fNameAndSuffix[1]).join(', ');
			if (isVarDef) {
				js = `const ${c.VAR_NAME_PREFIX}${newFuncName} = ${paramsJs}`;
			} else {
				js = `${newFuncName}(${paramsJs})`;
			}
		}
	}

	return js;
}

/**
 * Convert a Jaffle list into JavaScript code.
 * @param list the list to convert
 * @returns a string of JavaScript code which declares an array containing the list elements
 */
export function jaffleListToJs(list: JaffleList): string {
	// eslint-disable-next-line no-use-before-define
	return `[${list.map((item) => jaffleParamToJs(item)).join(', ')}]`;
}

export function jaffleParamToJs(param: JaffleAny): string {
	if (param instanceof Array) {
		return jaffleListToJs(param);
	}
	if (param instanceof Object) {
		return jaffleFuncToJs(toJaffleFunction(param));
	}
	if (typeof param === 'string') {
		return stringValueToJs(param);
	}
	if (typeof param === 'number') {
		return `${param}`;
	}
	return 'null';
}

/**
 * Converts a Yaml document reprensenting a tune in Jaffle syntax into Javascript code.
 * @param inputYaml a string containing the yaml document
 * @returns a string of Javascript code that can be used by Strudel to play the tune
 */
export function jaffleDocumentToJs(inputYaml: string): string {
	let tune: JaffleAny;
	let outputJs = '';

	try {
		tune = <JaffleList> loadYaml(inputYaml);
	} catch (err) {
		throw new ExporterError(err.message);
	}

	if (tune instanceof Array) {
		const tuneGroups = jaffleParamsToJsGroups(tune);

		if (tuneGroups.length === 0) {
			throw new ExporterError('document must contain at least one function');
		}

		const tuneMain = tuneGroups.pop();
		outputJs += tuneGroups.map((group) => `${group};\n`).join('');
		outputJs += `return ${tuneMain};`;
	} else {
		throw new ExporterError(
			`Document root must be an array, not ${typeof tune}`,
		);
	}

	return outputJs;
}
