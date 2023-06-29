import { load as loadYaml } from 'js-yaml';
import * as errors from './errors';

type JaffleLiteral = string | number | null;
// eslint-disable-next-line no-use-before-define
type JaffleAny = JaffleLiteral | JaffleFunction | JaffleList
type JaffleList = Array<JaffleAny>
type JaffleFunction = { [funcName: string]: JaffleAny }

const CHAINED_FUNC_PREFIX = '.';
const SERIALIZE_FUNC_SUFFIX = '^';

const OPTIONAL_STRING_PREFIX = '/';
const MINI_STRING_PREFIX = '_';
const EXPRESSION_STRING_PREFIX = '=';

const LAMBDA_NAME = 'set';
const LAMBDA_VAR = 'x';
const ALIASES: { [alias: string]: string } = {
	m: 'mini',
};

function serialize(thing: JaffleAny): string {
	return JSON.stringify(thing).replace(/"/g, "'");
}

function getJaffleFuncName(func: JaffleFunction) {
	const keys = Object.keys(func);
	if (keys.length === 0) {
		throw new errors.BadFunctionJaffleError('could not find function name');
	}
	if (keys.length > 1) {
		throw new errors.BadFunctionJaffleError(`too many function names: ${keys.join(', ')}`);
	}
	return keys[0];
}

function isJaffleFunction(thing: JaffleAny): boolean {
	return thing instanceof Object && !(thing instanceof Array);
}

function toJaffleFunction(thing: JaffleAny): JaffleFunction {
	if (!isJaffleFunction(thing)) {
		throw new errors.BadFunctionJaffleError('Not a function');
	}
	return <JaffleFunction>thing;
}

function isJaffleList(thing: JaffleAny): boolean {
	return thing instanceof Array;
}

function toJaffleList(thing: JaffleAny): JaffleList {
	if (!isJaffleList(thing)) {
		throw new errors.BadListJaffleError('Not a list');
	}
	return <JaffleList>thing;
}

function isJaffleMainFunc(func: JaffleFunction): boolean {
	return getJaffleFuncName(func)[0] !== CHAINED_FUNC_PREFIX;
}

function getJaffleFuncParams(thing: JaffleAny): Array<JaffleAny> {
	if (!(thing instanceof Object)) {
		return [thing];
	}
	return thing instanceof Array ? thing : [thing];
}

function groupJaffleFuncParams(list: JaffleList, serializedParamId = -1): Array<JaffleList> {
	if (list.length === 0) {
		throw new errors.BadFunctionJaffleError('group of params is empty');
	}
	const groups: Array<JaffleList> = [];
	let onMainFunc = false;

	list.forEach((item) => {
		if ([groups.length, -2].includes(serializedParamId)) {
			groups.push([item]);
		} else if (isJaffleFunction(item)) {
			const func = toJaffleFunction(item);
			if (isJaffleMainFunc(func)) {
				groups.push([item]);
				onMainFunc = true;
			} else {
				if (groups.length === 0) {
					throw new errors.BadFunctionJaffleError('chained function as first entry');
				}
				if (!onMainFunc) {
					throw new errors.BadFunctionJaffleError(
						'chained function outside function context',
					);
				}
				groups[groups.length - 1].push(item);
			}
		} else {
			groups.push([item]);
			onMainFunc = false;
		}
	});

	return groups;
}

function jaffleStringToJs(_str: string): string {
	const str = _str.trim();
	const quote = str.includes('\n') ? '`' : "'";

	if (str[0] === MINI_STRING_PREFIX) {
		return `mini(${quote}${str.substring(1)}${quote})`;
	}
	if (str[0] === EXPRESSION_STRING_PREFIX) {
		return str.substring(1).replace(/[^a-z0-9.+\-*/() ]|[a-z]{2,}/g, '');
	}
	return `${quote}${str[0] === OPTIONAL_STRING_PREFIX ? str.substring(1) : str}${quote}`;
}

function jaffleFunctionToJs(func: JaffleFunction): string {
	if (Object.keys(func).length === 0) {
		throw new errors.BadFunctionJaffleError('Function is empty');
	}

	const funcName = getJaffleFuncName(func);
	const funcNameAndSuffix = funcName.split(SERIALIZE_FUNC_SUFFIX);
	const serializeSuffix = funcNameAndSuffix[1];
	let [newFuncName] = funcNameAndSuffix;
	let js: string;

	newFuncName = newFuncName in ALIASES ? ALIASES[newFuncName] : newFuncName;
	newFuncName = newFuncName[0] === CHAINED_FUNC_PREFIX ? newFuncName.substring(1) : newFuncName;

	let serializedParamId = -1;
	if (serializeSuffix !== undefined) {
		serializedParamId = serializeSuffix === '' ? -2 : parseInt(serializeSuffix, 10) - 1;
	}

	if (newFuncName[0] === newFuncName[0].toUpperCase()) {
		js = newFuncName[0].toLowerCase() + newFuncName.substring(1);
	} else {
		const params = getJaffleFuncParams(func[funcName]);
		const paramGroups = groupJaffleFuncParams(params, serializedParamId);

		if (params.length === 0 || (params.length === 1 && params[0] === null)) {
			js = funcName === LAMBDA_NAME ? `${LAMBDA_VAR} => ${LAMBDA_VAR}` : `${newFuncName}()`;
		} else if (funcName === LAMBDA_NAME) {
			js = `(${LAMBDA_VAR}, ${(<string>params[0]).split('').join(', ')}) => ${LAMBDA_VAR}`;
		} else {
			const groupsJs = paramGroups
				.map((group, id) => (
					group
						.map((param) => (
							[id, -2].includes(serializedParamId)
								? serialize(param)
								// eslint-disable-next-line no-use-before-define
								: jaffleParamToJs(param)
						))
						.join('.')
				));
			js = `${newFuncName}(${groupsJs.join(', ')})`;
		}
	}

	return js;
}

function jaffleListToJs(list: JaffleList): string {
	// eslint-disable-next-line no-use-before-define
	return `[${list.map((item) => jaffleParamToJs(item)).join(', ')}]`;
}

function jaffleParamToJs(param: JaffleAny): string {
	if (param instanceof Array) {
		return jaffleListToJs(param);
	}
	if (param instanceof Object) {
		return jaffleFunctionToJs(param);
	}
	if (typeof param === 'string') {
		return jaffleStringToJs(param);
	}
	if (typeof param === 'number') {
		return `${param}`;
	}
	return 'null';
}

function jaffleInitBlockToJs(initBlock: JaffleList): string {
	try {
		return initBlock
			.map((item) => toJaffleFunction(item))
			.map((item) => `${jaffleFunctionToJs(item)};\n`)
			.join('');
	} catch (err) {
		throw new errors.BadInitBlockJaffleError(err.message);
	}
}

function jaffleDocumentToJs(inputYaml: string): string {
	let tune: JaffleFunction;
	let outputJs = '';

	try {
		tune = <JaffleFunction> loadYaml(inputYaml);
	} catch (err) {
		throw new errors.BadYamlJaffleError(err.message);
	}

	if (tune instanceof Object && !(tune instanceof Array)) {
		const { init: initArray, ...main } = tune;
		if (initArray !== undefined) {
			outputJs += jaffleInitBlockToJs(toJaffleList(initArray));
		}
		// checkJaffleMainFunction(main);
		outputJs += `return ${jaffleFunctionToJs(main)};`;
	} else {
		throw new errors.BadDocumentJaffleError(
			`Document root must be a dictionary, not ${typeof tune}`,
		);
	}

	return outputJs;
}

export const testing = {
	serialize,
	getJaffleFuncName,
	isJaffleFunction,
	toJaffleFunction,
	isJaffleList,
	toJaffleList,
	isJaffleMainFunc,
	getJaffleFuncParams,
	groupJaffleFuncParams,
	jaffleStringToJs,
	jaffleFunctionToJs,
	jaffleListToJs,
	jaffleParamToJs,
	jaffleInitBlockToJs,
	jaffleDocumentToJs,
};

export default jaffleDocumentToJs;
