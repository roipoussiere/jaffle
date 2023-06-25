/* eslint-disable @typescript-eslint/no-explicit-any */

// import * as yaml from 'js-yaml';
import * as errors from './errors';

// const SIGNALS_FN = ['Saw', 'Sine', 'Cosine', 'Tri', 'Square', 'Rand', 'Perlin',
// 	'Saw2', 'Sine2', 'Cosine2', 'Tri2', 'Square2', 'Rand2'];
// const LAMBDA_PARAMS_NAME = ['a', 'b', 'c'];

// function stringToJs(str: string): string {
// 	if (str[0] === '=') {
// 		return str.substring(1).replace(/[^a-c0-9.+\-*/()]/g, '');
// 	} if (str[0] === ':') {
// 		return `\`${str.substring(1)}\``;
// 	} if (str[0] === '/') {
// 		return `mini('${str.substring(1).replace(/\s+/g, ' ')}')`;
// 	}
// 	return `mini('${str.replace(/\s+/g, ' ')}')`;
// }

// function anyToJs(thing: any): string {
// 	if (thing instanceof Array) {
// 		return thing.map((item) => anyToJs(item)).join(', ');
// 	}
// 	if (thing instanceof Object) {
// 		// eslint-disable-next-line no-use-before-define
// 		return objectToJs(thing);
// 	}
// 	if (typeof thing === 'string') {
// 		return stringToJs(thing);
// 	}
// 	if (typeof thing === 'number') {
// 		return `${thing}`;
// 	}
// 	if (thing === null) {
// 		return '';
// 	}
// 	throw new errors.JaffleErrorBadType('array, object, string, number or null', typeof thing);
// }

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

// function getValue(attr: string, node: any): string {
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

// function checkObject(thing: any) {
// 	if (!(thing instanceof Object)) {
// 		throw new Error(`Expecting an object, not ${typeof thing}.`);
// 	}
// }

// function checkArray(thing: any) {
// 	if (!(thing instanceof Array)) {
// 		throw new Error(`Expecting an array, not ${typeof thing}.`);
// 	}
// }

type Obj = { [attr: string]: number }

function getUniqueAttr(obj: Obj) {
	const keys = Object.keys(obj);
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
Look for parameters in an array and return their name and value.
- `['b3e6', N: 'b6', add: 2]` returns `[ ['mini', 'b3e6'], ['n', 'b6'] ]`;
- `[n: 'b3e6', add: 2]` returns `[]`;
- `[add: 2, N: 'b3e6']` throws an error;
*/
function getParameters(array: Array<any>): Array<any> {
	const paramEntries = array
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

// function initArrayToJs(initNode: Array<object>): string {
// 	let js = '';
// 	if (!(initNode instanceof Array)) {
// 		throw new Error('Init content must be an array.');
// 	}
// 	initNode.forEach((item) => {
// 		const attr = getUniqueAttr(item);
// 		const newAttr = attr.split('^')[0];
// 		const prefix = attr[0] === '.' ? `await ${newAttr.substring(1)}` : newAttr.substring(0);

// 		js += `${prefix}(${getValue(attr, item, 0)});\n`;
// 	});
// 	return js;
// }

// function getChain(array: Array<object | string>): Array<[string, any]> {
// 	return [];
// }

// function objectToJs(obj: object): string {
// 	const mainAttr = getMainAttr(obj);
// 	checkArray(obj[mainAttr]);

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
// }

// getOtherAttributes(obj).forEach((attr) => {
// 	const newAttr = attr.split('^')[0];
// 	value = getValue(attr, obj, indentLvl);
// 	js += `${indent(indentLvl + 1)}.${newAttr}(${value})`;
// });

// return js;
// }

const transpile = () => '';
// function transpile(inputYaml: string): string {
// 	let tune: any;
// 	let outputJs = '';

// 	try {
// 		tune = <any> yaml.load(inputYaml);
// 	} catch (err) {
// 		throw new errors.JaffleErrorBadYaml(err);
// 	}

// 	if (tune instanceof Object) {
// 		// if ('Init' in tune) {
// 		// 	checkArray(tune.Init);
// 		// 	outputJs += initArrayToJs(tune.Init);
// 		// }
// 		outputJs += objectToJs(tune);
// 	} else if (tune instanceof Array) {
// 		throw new errors.JaffleErrorNotImplemented();
// 		// outputJs += objectToJs(tune, 0);
// 	} else {
// 		throw new errors.JaffleErrorBadType('array or dictionnary', typeof tune);
// 	}

// 	return `\nreturn ${outputJs};\n`;
// }

export const testing = {
	getParameters, getUniqueAttr, isChainItem,
};

export default transpile;
