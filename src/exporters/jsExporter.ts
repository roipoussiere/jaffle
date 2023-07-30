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
	if (rawName[0] === rawName[0].toUpperCase()) {
		return rawName[0].toLowerCase() + rawName.substring(1);
	}
	return rawName;
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
	if (entry.rawName === '' && entry.rawValue[0] !== c.MINI_STR_PREFIX) {
		return EntryType.Value;
	}
	if (entry.rawName[0] === c.CHAINED_FUNC_PREFIX) {
		return EntryType.ChainedFunction;
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

	if (entry.rawValue === '' || entry.rawName === '') {
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
export function entryToJs(_entry: Entry): string {
	const entry = expandEntry(_entry);
	const entryType = entryToEntryType(entry);

	if (entryType === EntryType.Value) {
		return rawValueToJs(entry.rawValue);
	}

	if (entryType === EntryType.List) {
		return `[${entry.children.map((item) => entryToJs(item)).join(', ')}]`;
	}

	const funcName = rawNameToFuncName(entry.rawName);

	if (entryType === EntryType.Object) {
		return funcName;
	}

	if (entryType === EntryType.LambdaFunction) {
		return lambdaEntryToJs(entry.rawValue.split(','));
	}

	const serializeSuffix = entry.rawName.split(c.SERIALIZE_FUNC_SUFFIX)[1];
	// eslint-disable-next-line no-use-before-define
	const jsGroups = paramsToJsGroups(entry.children, serializeSuffix);

	if (entryType === EntryType.ConstantDef) {
		return `const ${c.VAR_NAME_PREFIX}${funcName} = ${jsGroups[0]}`;
	}

	return `${funcName}(${jsGroups.join(', ')})`;
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
				[id, -2].includes(serializedParamId) ? serialize(param) : entryToJs(param)
			))
			.join('.')
		));
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
