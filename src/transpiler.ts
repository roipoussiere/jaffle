import * as yaml from 'js-yaml';
import * as errors from './errors';

type JaffleLiteral = string | number | null;
// eslint-disable-next-line no-use-before-define
type JaffleAny = JaffleLiteral | JaffleFunction | JaffleList
type JaffleList = Array<JaffleAny>
type JaffleFunction = { [attr: string]: JaffleAny }

// const LAMBDA_PARAMS_NAME = ['a', 'b', 'c'];
const NO_PAREN_SIGN = '_';

function jaffleStringToJs(str: string): string {
	return `\`${str}\``;
	// if (str[0] === '=') {
	// 	return str.substring(1).replace(/[^a-c0-9.+\-*/()]/g, '');
	// } if (str[0] === ':') {
	// 	return `\`${str.substring(1)}\``;
	// } if (str[0] === '/') {
	// 	return `mini('${str.substring(1).replace(/\s+/g, ' ')}')`;
	// }
	// return `mini('${str.replace(/\s+/g, ' ')}')`;
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
	if (thing === null) {
		return 'null';
	}
	throw new errors.BadTypeJaffleError('basically anything', typeof thing);
}

// function getMainAttr(node: any): string {
// 	const mainAttrs = Object.keys(node).filter((key) => key[0] !== key[0].toLowerCase());

// 	if (mainAttrs.length === 0) {
// 		throw new Error('Main attribute not found.');
// 	}
// 	if (mainAttrs.length > 1) {
// 		throw new Error(`Too many main attributes: ${mainAttrs.join(', ')}`);
// 	}
// 	return mainAttrs[0];
// 	return '';
// }

// function getOutroAttributes(node: any): string[] {
// 	return Object.keys(node).filter((key) => key[0] === '.');
// }

// function getOtherAttributes(node: any): string[] {
// 	return Object.keys(node).filter((key) => key[0] === key[0].toLowerCase() && key[0] !== '.');
// }

// function indent(lvl: number): string {
// 	return lvl === 0 ? '' : `\n${'	'.repeat(lvl)}`;
// }

// function serialize(node: any): string {
// 	return JSON.stringify(node, null, '	').replace(/"/g, "'");
// }

// function getValues(attr: string, node: any): string {
// 	const suffix = attr.split('^')[1];

// 	if (suffix === undefined) {
// 		return parseNode(node[attr]);
// 	}
// 	if (suffix === '') {
// 		return serialize(node[attr]);
// 	}
// 	const paramId = parseInt(suffix, 10) - 1;
// 	return node[attr].map((child: any, id: number) => (
// 		id === paramId ? serialize(child) : literalToJs(child)
// 	));
// }

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

function getJaffleFuncName(dict: JaffleFunction) {
	checkJaffleFunction(dict);

	const keys = Object.keys(dict);
	if (keys.length === 0) {
		throw new errors.BadFunctionJaffleError('object is empty');
	}
	if (keys.length > 1) {
		throw new errors.BadFunctionJaffleError(`too many main attributes: ${keys.join(', ')}`);
	}
	return keys[0];
}

function isJaffleMainFunction(thing: JaffleAny): boolean {
	if (thing instanceof Object && !(thing instanceof Array)) {
		const item = getJaffleFuncName(thing);
		return item[0] === item[0].toUpperCase();
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
function getJaffleFuncParams(thing: JaffleAny): Array<JaffleAny> {
	if (thing instanceof Array) {
		const paramsId = thing
			.map((item, id) => (isJaffleMainFunction(item) ? id : -1))
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
	return [thing];
}

// function getChain(array: Array<object | string>): Array<[string, any]> {
// 	return [];
// }

function jaffleFunctionToJs(dict: JaffleFunction): string {
	if (Object.keys(dict).length === 0) {
		throw new errors.BadFunctionJaffleError('Function is empty');
	}

	const attr = getJaffleFuncName(dict);
	const newAttr = attr[0].toLowerCase() + attr.substring(1);
	let js: string;

	if (attr.includes(NO_PAREN_SIGN)) {
		js = newAttr.substring(0, newAttr.length - 1);
	} else {
		const params = getJaffleFuncParams(dict[attr]);
		if (params.length === 0 || (params.length === 1 && params[0] === null)) {
			js = `${newAttr}()`;
		} else {
			js = `${newAttr}(${params.map((param) => jaffleAnyToJs(param)).join(', ')})`;
		}
	}

	// 	const chain = getChain(obj[mainAttr]);
	// 	if (chain.length !== 0) {
	// 		const chainJS = chain.map((attr, child) => `.${attr}(${anyToJs(child)})`);
	// 		js += chainJS.join('');
	// 	}

	// 	return js;
	// const chainJS = .map((attr, child) => anyToJs(child));
	// if (mainAttr === 'M') {
	// 	js = valueToString(obj[mainAttr]);
	// } else if (mainAttr === 'Set') {
	// 	if (obj[mainAttr] === null) {
	// 		js = 'x => x';
	// 	} else {
	// 		const paramNames = LAMBDA_PARAMS_NAME.slice(0, obj[mainAttr]);
	// 		js = `(x, ${paramNames.join(', ')}) => x`;
	// 	}
	// } else {
	// 	const newAttr = mainAttr.split('^')[0];
	// 	js = indent(indentLvl) + newAttr[0].toLowerCase() + newAttr.substring(1);
	// 	if (obj[mainAttr] !== null && !SIGNALS_FN.includes(newAttr)) {
	// 		value = getValue(mainAttr, obj, indentLvl);
	// 		js += `(${value})`;
	// 	}
	return js;
}

// getOtherAttributes(obj).forEach((attr) => {
// 	const newAttr = attr.split('^')[0];
// 	value = getValue(attr, obj, indentLvl);
// 	js += `${indent(indentLvl + 1)}.${newAttr}(${value})`;
// });

// return js;
// }

function jaffleInitListToJs(initArray: JaffleList): string {
	checkJaffleList(initArray);

	return initArray
		.map((item) => checkJaffleFunction(item))
		.filter((item) => Object.keys(item).length !== 0)
		.map((item) => `${jaffleFunctionToJs(item)};\n`)
		.join('');
}

function jaffleDocumentToJs(inputYaml: string): string {
	let tune: JaffleFunction;
	let outputJs = '';

	try {
		tune = <JaffleFunction> yaml.load(inputYaml);
	} catch (err) {
		throw new errors.BadYamlJaffleError(err.message);
	}

	if (tune instanceof Object && !(tune instanceof Array)) {
		const { Init: initArray, ...main } = tune;
		if (initArray !== undefined) {
			outputJs += jaffleInitListToJs(checkJaffleList(initArray));
		}
		outputJs += `return ${jaffleFunctionToJs(main)};`;
	} else {
		throw new errors.BadDocumentJaffleError(`Document root must be a dictionary, not ${typeof tune}`);
	}

	return outputJs;
}

export const testing = {
	getJaffleFuncParams,
	getJaffleFuncName,
	isJaffleChainedFunc,
	jaffleStringToJs,
	jaffleAnyToJs,
	jaffleInitListToJs,
	jaffleFunctionToJs,
	checkJaffleFunction,
	checkJaffleList,
	jaffleDocumentToJs,
};

export default jaffleDocumentToJs;
