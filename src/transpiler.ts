import { load as loadYaml } from 'js-yaml';
import * as errors from './errors';

type JaffleLiteral = string | number | null;
// eslint-disable-next-line no-use-before-define
type JaffleAny = JaffleLiteral | JaffleFunction | JaffleList
type JaffleList = Array<JaffleAny>
type JaffleFunction = { [funcName: string]: JaffleAny }

const NO_PAREN_FUNC_SUFFIX = '-';
const SERIALIZE_FUNC_SUFFIX = '^';

const OPTIONAL_STRING_PREFIX = '_';
const MINI_STRING_PREFIX = '.';
const EXPRESSION_STRING_PREFIX = '=';

function jaffleStringToJs(str: string): string {
	if (str[0] === MINI_STRING_PREFIX) {
		return `mini('${str.substring(1)}')`;
	}
	if (str[0] === EXPRESSION_STRING_PREFIX) {
		return str.substring(1).replace(/[^a-z0-9.+\-*/() ]|[a-z]{2,}/g, '');
	}
	return `'${str[0] === OPTIONAL_STRING_PREFIX ? str.substring(1) : str}'`;
}

function jaffleAnyToJs(thing: JaffleAny): string {
	if (thing instanceof Array) {
		return thing.map((item) => jaffleAnyToJs(item)).join(', ');
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

function checkJaffleFunction(thing: JaffleAny): JaffleFunction {
	if (!(thing instanceof Object) || thing instanceof Array) {
		throw new errors.BadFunctionJaffleError('Not a function');
	}
	return <JaffleFunction>thing;
}

function checkJaffleList(thing: JaffleAny): JaffleList {
	if (!(thing instanceof Array)) {
		throw new errors.BadListJaffleError('Not a list');
	}
	return <JaffleList>thing;
}

function getJaffleFuncName(func: JaffleFunction) {
	checkJaffleFunction(func);

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
	const funcName = getJaffleFuncName(checkJaffleFunction(thing));
	if (funcName[0] !== funcName[0].toUpperCase()) {
		throw new errors.BadFunctionJaffleError('expecting a main function');
	}

	return <JaffleFunction>thing;
}

function isJaffleFuncParameter(thing: JaffleAny): boolean {
	if (thing instanceof Object && !(thing instanceof Array)) {
		const funcName = getJaffleFuncName(thing);
		return funcName[0] === funcName[0].toUpperCase();
	}
	return true;
}

function isJaffleChainedFunc(thing: JaffleAny): boolean {
	if (thing instanceof Object && !(thing instanceof Array)) {
		const item = getJaffleFuncName(thing);
		return item[0] === item[0].toLowerCase();
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
	if (!(thing instanceof Array)) {
		return [thing];
	}

	const paramsId = thing
		.map((item, id) => (id === serializedParamId || isJaffleFuncParameter(item) ? id : -1))
		.filter((id) => id !== -1);

	if (paramsId.length === 0) {
		return [];
	}

	const lastParamId = paramsId[paramsId.length - 1];
	if (lastParamId >= paramsId.length) {
		throw new errors.BadFunctionJaffleError('Parameters must be defined before the chain.');
	}

	return thing.filter((_item, id) => paramsId.includes(id));
}

function getJaffleFuncChain(thing: JaffleAny): Array<JaffleFunction> {
	if (!(thing instanceof Array)) {
		return [];
	}
	return thing
		.filter((item) => isJaffleChainedFunc(item))
		.map((func) => checkJaffleFunction(func));
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

	newFuncName = newFuncName === 'M'
		? 'mini'
		: newFuncName[0].toLowerCase() + newFuncName.substring(1);

	let serializedParamId = -1;
	if (serializeSuffix !== undefined) {
		if (serializeSuffix === '') {
			return `${newFuncName}(${serialize(func[funcName])})`;
		}
		serializedParamId = parseInt(serializeSuffix, 10) - 1;
	}

	if (funcName.slice(-1) === NO_PAREN_FUNC_SUFFIX) {
		js = newFuncName.substring(0, newFuncName.length - 1);
	} else {
		const params = getJaffleFuncParams(func[funcName], serializedParamId);
		if (params.length === 0 || (params.length === 1 && params[0] === null)) {
			js = funcName === 'Set' ? 'x => x' : `${newFuncName}()`;
		} else if (funcName === 'Set') {
			js = `(x, ${(<string>params[0]).split('').join(', ')}) => x`;
		} else {
			const newParams = params.map((param, id) => (
				id === serializedParamId ? serialize(param) : jaffleAnyToJs(param)
			));
			js = `${newFuncName}(${newParams.join(', ')})`;
		}
	}

	js += getJaffleFuncChain(func[funcName])
		.map((chainedFunc) => `.${jaffleFunctionToJs(chainedFunc)}`)
		.join('');

	return js;
}

function jaffleInitBlockToJs(initBlock: JaffleList): string {
	try {
		return checkJaffleList(initBlock)
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
			outputJs += jaffleInitBlockToJs(checkJaffleList(initArray));
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
	checkJaffleFunction,
	checkJaffleList,
	jaffleDocumentToJs,
};

export default jaffleDocumentToJs;
