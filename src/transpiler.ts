import { load as loadYaml } from 'js-yaml';
import * as errors from './errors';

type JaffleLiteral = string | number | null;
// eslint-disable-next-line no-use-before-define
type JaffleAny = JaffleLiteral | JaffleFunction | JaffleList
type JaffleList = Array<JaffleAny>
type JaffleFunction = { [funcName: string]: JaffleAny }

const NO_PAREN_FUNC_SUFFIX = '.';
const SERIALIZE_FUNC_SUFFIX = '^';

const OPTIONAL_STRING_PREFIX = '/';
const MINI_STRING_PREFIX = '_';
const EXPRESSION_STRING_PREFIX = '=';

const LAMBDA_NAME = 'Set';
const LAMBDA_VAR = 'x';
const ALIASES: { [alias: string]: string } = {
	M: 'mini',
};

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

function jaffleAnyToJs(thing: JaffleAny): string {
	if (thing instanceof Array) {
		return `[${thing.map((item) => jaffleAnyToJs(item)).join(', ')}]`;
	}
	if (thing instanceof Object) {
		// eslint-disable-next-line no-use-before-define
		return jaffleFunctionToJs(thing);
	}
	if (typeof thing === 'string') {
		return jaffleStringToJs(thing);
	}
	if (typeof thing === 'number') {
		return `${thing}`;
	}
	return 'null';
}

function serialize(thing: JaffleAny): string {
	return JSON.stringify(thing).replace(/"/g, "'");
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

function checkJaffleMainFunction(thing: JaffleAny): JaffleFunction {
	const funcName = getJaffleFuncName(toJaffleFunction(thing));
	if (funcName[0] !== funcName[0].toUpperCase()) {
		throw new errors.BadFunctionJaffleError('expecting a main function');
	}

	return <JaffleFunction>thing;
}

function isJaffleFuncParameter(thing: JaffleAny): boolean {
	if (isJaffleFunction(thing)) {
		const funcName = getJaffleFuncName(toJaffleFunction(thing));
		return funcName[0] === funcName[0].toUpperCase();
	}
	return true;
}

function isJaffleChainedFunc(thing: JaffleAny): boolean {
	if (isJaffleFunction(thing)) {
		const funcName = getJaffleFuncName(toJaffleFunction(thing));
		return funcName[0] === funcName[0].toLowerCase();
	}
	return false;
}

/**
Return the parameters found in an array.
- `['b3e6', {N: 'b6'}, {add: 2}]` returns `[ 'b3e6', {N: 'b6'} ]`;
- `[n: 'b3e6', add: 2]` returns `[]`;
- `{foo: 42}` returns `[{foo: 42}]`;
- `42` returns `[42]`;
- `[add: 2, N: 'b3e6']` throws an error;
*/
function getJaffleFuncParams(thing: JaffleAny, serializedParamId = -1): Array<JaffleAny> {
	if (!(thing instanceof Object)) {
		return [thing];
	}
	const list = thing instanceof Array ? thing : [thing];
	const paramsId = list
		.map((item, id) => (
			[id, -2].includes(serializedParamId) || isJaffleFuncParameter(item) ? id : -1
		)).filter((id) => id !== -1);

	if (paramsId.length === 0) {
		return [];
	}

	const lastParamId = paramsId[paramsId.length - 1];
	if (lastParamId >= paramsId.length) {
		throw new errors.BadFunctionJaffleError('Parameters must be defined before the chain.');
	}

	return list.filter((_item, id) => paramsId.includes(id));
}

function getJaffleFuncChain(thing: JaffleAny, serializedParamId = -1): Array<JaffleFunction> {
	if (!(thing instanceof Object)) {
		return [];
	}
	const list = thing instanceof Array ? thing : [thing];

	return list
		.filter((item, id) => ![id, -2].includes(serializedParamId) && isJaffleChainedFunc(item))
		.map((item) => toJaffleFunction(item));
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

	newFuncName = newFuncName in ALIASES
		? ALIASES[newFuncName]
		: newFuncName[0].toLowerCase() + newFuncName.substring(1);

	let serializedParamId = -1;
	if (serializeSuffix !== undefined) {
		serializedParamId = serializeSuffix === '' ? -2 : parseInt(serializeSuffix, 10) - 1;
	}

	if (funcName.slice(-1) === NO_PAREN_FUNC_SUFFIX) {
		js = newFuncName.substring(0, newFuncName.length - 1);
	} else {
		const params = getJaffleFuncParams(func[funcName], serializedParamId);

		if (params.length === 0 || (params.length === 1 && params[0] === null)) {
			js = funcName === LAMBDA_NAME ? `${LAMBDA_VAR} => ${LAMBDA_VAR}` : `${newFuncName}()`;
		} else if (funcName === LAMBDA_NAME) {
			js = `(${LAMBDA_VAR}, ${(<string>params[0]).split('').join(', ')}) => ${LAMBDA_VAR}`;
		} else {
			const newParams = params.map((param, id) => (
				[id, -2].includes(serializedParamId) ? serialize(param) : jaffleAnyToJs(param)
			));
			js = `${newFuncName}(${newParams.join(', ')})`;
		}
	}

	js += getJaffleFuncChain(func[funcName], serializedParamId)
		.map((chainedFunc) => `.${jaffleFunctionToJs(chainedFunc)}`)
		.join('');

	return js;
}

function jaffleInitBlockToJs(initBlock: JaffleList): string {
	try {
		return initBlock
			.map((item) => checkJaffleMainFunction(item))
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
		const { Init: initArray, ...main } = tune;
		if (initArray !== undefined) {
			outputJs += jaffleInitBlockToJs(toJaffleList(initArray));
		}
		checkJaffleMainFunction(main);
		outputJs += `return ${jaffleFunctionToJs(main)};`;
	} else {
		throw new errors.BadDocumentJaffleError(
			`Document root must be a dictionary, not ${typeof tune}`,
		);
	}

	return outputJs;
}

export const testing = {
	getJaffleFuncParams,
	getJaffleFuncName,
	isJaffleChainedFunc,
	jaffleStringToJs,
	serialize,
	jaffleAnyToJs,
	jaffleInitBlockToJs,
	jaffleFunctionToJs,
	isJaffleFunction,
	toJaffleFunction,
	isJaffleList,
	toJaffleList,
	jaffleDocumentToJs,
};

export default jaffleDocumentToJs;
