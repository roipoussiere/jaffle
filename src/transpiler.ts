import { load as loadYaml } from 'js-yaml';
import * as errors from './errors';

type JaffleLiteral = string | number | null;
// eslint-disable-next-line no-use-before-define
type JaffleAny = JaffleLiteral | JaffleFunction | JaffleList
type JaffleList = Array<JaffleAny>
type JaffleFunction = { [funcName: string]: JaffleAny }

const CHAINED_FUNC_PREFIX = '.';
const SERIALIZE_FUNC_SUFFIX = '^';
const INIT_FUNC_PREFIX = '_';
const VAR_FUNC_PREFIX = '$';

const OPTIONAL_STR_PREFIX = '/';
const MINI_STR_PREFIX = '_';
const EXPR_STR_PREFIX = '=';

const VAR_NAME_PREFIX = '_';
const LAMBDA_NAME = 'set';
const LAMBDA_VAR = '_x';

export function serialize(thing: JaffleAny): string {
	return JSON.stringify(thing).replace(/"/g, "'");
}

export function isJaffleFunction(thing: JaffleAny): boolean {
	// return (typeof thing === 'string' && [MINI_STR_PREFIX, EXPR_STR_PREFIX].includes(thing[0]))
	return thing instanceof Object && !(thing instanceof Array);
}

export function getJaffleFuncName(func: JaffleFunction) {
	if (!isJaffleFunction(func)) {
		throw new errors.BadFunctionJaffleError('Not a function');
	}
	const keys = Object.keys(func);
	if (keys.length === 0) {
		throw new errors.BadFunctionJaffleError('could not find function name');
	}
	if (keys.length > 1) {
		throw new errors.BadFunctionJaffleError(`too many function names: ${keys.join(', ')}`);
	}
	return keys[0];
}

export function toJaffleFunction(thing: JaffleAny): JaffleFunction {
	if (typeof thing === 'string') {
		if (thing[0] === MINI_STR_PREFIX) {
			return { mini: thing.substring(1) };
		}
		if (thing[0] === EXPR_STR_PREFIX) {
			return { expr: thing.substring(1) };
		}
	}
	if (isJaffleFunction(thing)) {
		return <JaffleFunction>thing;
	}
	throw new errors.BadFunctionJaffleError('Not a function');
}

export function extractJaffleInitBlock(params: JaffleList): [JaffleList, JaffleList] {
	const initBlock: JaffleList = [];
	const mainBlock: JaffleList = [];

	params.forEach((param) => {
		const func = toJaffleFunction(param);
		const funcName = getJaffleFuncName(func);
		const isInitBlock = [INIT_FUNC_PREFIX, VAR_FUNC_PREFIX].includes(funcName[0]);
		(isInitBlock ? initBlock : mainBlock).push(param);
	});
	return [initBlock, mainBlock];
}

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

export function groupJaffleFuncParams(list: JaffleList, serializedParamId = -1): Array<JaffleList> {
	if (list.length === 0) {
		throw new errors.BadFunctionJaffleError('group of params is empty');
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
		if (funcName[0] === CHAINED_FUNC_PREFIX) {
			if (groups.length === 0) {
				throw new errors.BadFunctionJaffleError('chained function as first entry');
			}
			if (!onMainFunc) {
				throw new errors.BadFunctionJaffleError('orphan chained function');
			}
			groups[groups.length - 1].push(item);
		} else {
			groups.push([item]);
			onMainFunc = true;
		}
	});

	return groups;
}

export function jaffleStringToJs(str: string): string {
	const isPrefixed = [MINI_STR_PREFIX, EXPR_STR_PREFIX, OPTIONAL_STR_PREFIX].includes(str[0]);
	const newStr = (isPrefixed ? str.substring(1) : str).trim();
	const quote = newStr.includes('\n') ? '`' : "'";
	let js: string;

	if (str[0] === EXPR_STR_PREFIX) {
		if (newStr.match(/[^a-zA-Z0-9.+\-*/() ]/g)) {
			throw new errors.BadStringJaffleError(`Not a valid expression string: ${newStr}`);
		}
		js = newStr.replace(/[a-z][a-zA-Z0-9]*/g, `${VAR_NAME_PREFIX}$&`);
	} else {
		js = `${quote}${newStr}${quote}`;
		js = str[0] === MINI_STR_PREFIX ? `mini(${js})` : js;
	}
	return js;
}

export function jaffleParamsToJsGroups(params: JaffleList, serializSuffix?: string): Array<string> {
	if (params.length === 0) {
		return [];
	}

	let serializedParamId = -1;
	if (serializSuffix !== undefined) {
		serializedParamId = serializSuffix === '' ? -2 : parseInt(serializSuffix, 10) - 1;
	}

	return groupJaffleFuncParams(params, serializedParamId)
		.map((group, id) => (group
			.map((param) => (
				// eslint-disable-next-line no-use-before-define
				[id, -2].includes(serializedParamId) ? serialize(param) : jaffleParamToJs(param)
			))
			.join('.')
		));
}

export function jaffleLambdaToJs(params: JaffleList): string {
	if (params.length === 0) {
		return `${LAMBDA_VAR} => ${LAMBDA_VAR}`;
	}
	const varsJs = params.map((varName) => VAR_NAME_PREFIX + varName).join(', ');
	return `(${LAMBDA_VAR}, ${varsJs}) => ${LAMBDA_VAR}`;
}

export function jaffleFuncToJs(func: JaffleFunction): string {
	if (Object.keys(func).length === 0) {
		throw new errors.BadFunctionJaffleError('Function is empty');
	}

	const funcName = getJaffleFuncName(func);
	const fNameAndSuffix = funcName.split(SERIALIZE_FUNC_SUFFIX);
	let [newFuncName] = fNameAndSuffix;
	let js: string;
	const isVarDef = newFuncName[0] === VAR_FUNC_PREFIX;

	newFuncName = [CHAINED_FUNC_PREFIX, INIT_FUNC_PREFIX, VAR_FUNC_PREFIX].includes(newFuncName[0])
		? newFuncName.substring(1) : newFuncName;

	if (newFuncName[0] === newFuncName[0].toUpperCase()) {
		js = newFuncName[0].toLowerCase() + newFuncName.substring(1);
	} else {
		const params = getJaffleFuncParams(func[funcName]);

		if (funcName === LAMBDA_NAME) {
			js = jaffleLambdaToJs(params);
		} else if (params.length === 0) {
			js = `${newFuncName}()`;
		} else {
			const paramsJs = jaffleParamsToJsGroups(params, fNameAndSuffix[1]).join(', ');
			if (isVarDef) {
				js = `const ${VAR_NAME_PREFIX}${newFuncName} = ${paramsJs}`;
			} else {
				js = `${newFuncName}(${paramsJs})`;
			}
		}
	}

	return js;
}

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
		return jaffleStringToJs(param);
	}
	if (typeof param === 'number') {
		return `${param}`;
	}
	return 'null';
}

export function jaffleDocumentToJs(inputYaml: string): string {
	let tune: JaffleAny;
	let initBlock: JaffleList;
	let outputJs = '';

	try {
		tune = <JaffleList> loadYaml(inputYaml);
	} catch (err) {
		throw new errors.BadYamlJaffleError(err.message);
	}

	if (tune instanceof Array) {
		[initBlock, tune] = extractJaffleInitBlock(<JaffleList>tune);

		outputJs += jaffleParamsToJsGroups(initBlock).join(';\n');
		outputJs += outputJs === '' ? '' : ';\n';

		const groups = jaffleParamsToJsGroups(tune);
		if (groups.length !== 1) {
			throw new errors.BadDocumentJaffleError('document root must contain one main function');
		}
		outputJs += `return ${groups[0]};`;
	} else {
		throw new errors.BadDocumentJaffleError(
			`Document root must be an array, not ${typeof tune}`,
		);
	}

	return outputJs;
}
