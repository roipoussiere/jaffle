/* eslint-disable @typescript-eslint/no-explicit-any */

import * as yaml from 'js-yaml';
import * as errors from './errors';

type Dict = { [attr: string]: any }

// const SIGNALS_FN = ['Saw', 'Sine', 'Cosine', 'Tri', 'Square', 'Rand', 'Perlin',
// 	'Saw2', 'Sine2', 'Cosine2', 'Tri2', 'Square2', 'Rand2'];
// const LAMBDA_PARAMS_NAME = ['a', 'b', 'c'];

function stringToJs(str: string): string {
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

function anyToJs(thing: any): string {
	if (thing instanceof Array) {
		return thing.map((item) => anyToJs(item)).join(', ');
	}
	if (thing instanceof Object) {
		// eslint-disable-next-line no-use-before-define
		return dictToJs(thing);
	}
	if (typeof thing === 'string') {
		return stringToJs(thing);
	}
	if (typeof thing === 'number') {
		return `${thing}`;
	}
	if (thing === null) {
		return '';
	}
	throw new errors.JaffleErrorBadType('basically anything', typeof thing);
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

function checkDict(thing: any): void {
	if (!(thing instanceof Object) || thing instanceof Array) {
		throw new errors.JaffleErrorBadType('dictionary', typeof thing);
	}
}

function checkArray(thing: any) {
	if (!(thing instanceof Array)) {
		throw new errors.JaffleErrorBadType('array', typeof thing);
	}
}

function getUniqueAttr(dict: Dict) {
	checkDict(dict);

	const keys = Object.keys(dict);
	if (keys.length === 0) {
		throw new errors.JaffleAttributeError('object is empty');
	}
	if (keys.length > 1) {
		throw new errors.JaffleAttributeError(`too many main attributes: ${keys.join(', ')}`);
	}
	return keys[0];
}

function isChainItem(thing: any): boolean {
	if (thing instanceof Object && !(thing instanceof Array)) {
		const item = getUniqueAttr(thing);
		return item[0] === item[0].toLowerCase();
	}
	return false;
}

function isParamItem(thing: any): boolean {
	if (thing instanceof Object && !(thing instanceof Array)) {
		const item = getUniqueAttr(thing);
		return item[0] === item[0].toUpperCase();
	}
	return true;
}

/**
Return the parameters found in an array.
- `['b3e6', {N: 'b6'}, {add: 2}]` returns `[ 'b3e6', {N: 'b6'} ]`;
- `[n: 'b3e6', add: 2]` returns `[]`;
- `{foo: 42}` returns `[{foo: 42}]`;
- `42` returns `[42]`;
- `[add: 2, N: 'b3e6']` throws an error;
*/
function getParameters(thing: any): Array<any> {
	if (thing instanceof Array) {
		const paramEntries = thing
			.map((item, id) => [item, id])
			.filter(([item]) => isParamItem(item));

		if (paramEntries.length === 0) {
			return [];
		}

		const lastParamId = paramEntries[paramEntries.length - 1][1];
		if (lastParamId >= paramEntries.length) {
			throw new errors.JaffleAttributeError('Parameters must be defined before the chain.');
		}
		return paramEntries.map(([attr]) => attr);
	}
	return [thing];
}

// function getChain(array: Array<object | string>): Array<[string, any]> {
// 	return [];
// }

function dictToJs(dict: Dict): string {
	const attr = getUniqueAttr(dict);
	const newAttr = attr[0].toLowerCase() + attr.substring(1);
	const params = getParameters(dict[attr]);
	const paramsJs = params.map((param) => anyToJs(param));
	const js = `${newAttr}(${paramsJs.join(', ')})`;
	return js;
	// 	let js = mainAttr;

	// 	if (!SIGNALS_FN.includes(mainAttr)) {
	// 		const params = getParameters(obj[mainAttr]);
	// 		const paramsJs = params.map((attr, child) => anyToJs(child));
	// 		js += `(${paramsJs.join(', ')})`;
	// 	}

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
	// return '';
}

// getOtherAttributes(obj).forEach((attr) => {
// 	const newAttr = attr.split('^')[0];
// 	value = getValue(attr, obj, indentLvl);
// 	js += `${indent(indentLvl + 1)}.${newAttr}(${value})`;
// });

// return js;
// }

function initArrayToJs(initArray: Array<Dict> | undefined): string {
	if (initArray === undefined) {
		return '';
	}
	checkArray(initArray);

	return initArray
		.filter((item) => Object.keys(item).length !== 0)
		.map((item) => `${dictToJs(item)};\n`)
		.join('');
}

function transpile(inputYaml: string): string {
	let tune: Dict;
	let outputJs = '';

	try {
		tune = <Dict> yaml.load(inputYaml);
	} catch (err) {
		throw new errors.JaffleErrorBadYaml(err.message);
	}

	if (tune instanceof Object && !(tune instanceof Array)) {
		const { Init: initArray, ...main } = tune;
		outputJs += initArrayToJs(initArray);
		outputJs += `return ${dictToJs(main)};`;
	} else {
		throw new errors.JaffleErrorBadType('dictionary', typeof tune);
	}

	return outputJs;
}

export const testing = {
	getParameters,
	getUniqueAttr,
	isChainItem,
	stringToJs,
	anyToJs,
	initArrayToJs,
	dictToJs,
	checkDict,
	checkArray,
	transpile,
};

export default transpile;
