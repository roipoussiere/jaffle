/* eslint-disable @typescript-eslint/no-explicit-any */

import * as yaml from 'js-yaml';

const SIGNALS_FN = ['Saw', 'Sine', 'Cosine', 'Tri', 'Square', 'Rand', 'Perlin',
	'Saw2', 'Sine2', 'Cosine2', 'Tri2', 'Square2', 'Rand2'];
const LAMBDA_PARAMS_NAME = ['a', 'b', 'c'];

function valueToString(value: any): string {
	if (value === null) {
		return '';
	} if (typeof value === 'number') {
		return `${value}`;
	} if (value[0] === '=') {
		return value.substring(1).replace(/[^a-c0-9.+\-*/()]/g, '');
	} if (value[0] === ':') {
		return `'${value.substring(1)}'`;
	} if (value[0] === '/') {
		return `mini('${value.substring(1).trim()}')`;
	}
	return `mini('${value.trim()}')`;
}

function parseNode(node: any, indentLvl = 0): string {
	if (node instanceof Array) {
		return node.map((item) => parseNode(item, indentLvl + 2)).join(', ');
	}
	if (node instanceof Object) {
		// eslint-disable-next-line no-use-before-define
		return parseObject(node, indentLvl);
	}
	return valueToString(node);
}

function getMainAttribute(node: any): string {
	const mainAttrs = Object.keys(node).filter((key) => key[0] !== key[0].toLowerCase());

	if (mainAttrs.length === 0) {
		throw new Error('Main attribute not found.');
	}
	if (mainAttrs.length > 1) {
		throw new Error(`Too many main attributes: ${mainAttrs.join(', ')}`);
	}
	return mainAttrs[0];
}

function getOutroAttributes(node: any): string[] {
	return Object.keys(node).filter((key) => key[0] === '.');
}

function getOtherAttributes(node: any): string[] {
	return Object.keys(node).filter((key) => key[0] === key[0].toLowerCase() && key[0] !== '.');
}

function indent(lvl: number): string {
	return lvl === 0 ? '' : `\n${'  '.repeat(lvl)}`;
}

function serialize(node: any): string {
	return JSON.stringify(node, null, '  ').replace(/"/g, "'");
}

function getValue(attr: string, node: any, indentLvl: number): string {
	const suffix = attr.split('^')[1];

	if (suffix === undefined) {
		return parseNode(node[attr], indentLvl);
	}
	if (suffix === '') {
		return serialize(node[attr]);
	}
	const paramId = parseInt(suffix, 10) - 1;
	return node[attr].map((child: any, id: number) => (
		id === paramId ? serialize(child) : valueToString(child)
	));
}

function parseOutro(node: any): string {
	let js = '';
	getOutroAttributes(node).forEach((attr) => {
		const newAttr = attr.split('^')[0];
		const prefix = attr[1] === '.' ? `await ${newAttr.substring(2)}` : newAttr.substring(1);
		js += `${prefix}(${getValue(attr, node, 0)})\n`;
	});
	return js;
}

function parseObject(node: any, indentLvl: number): string {
	let js: string;
	let value: string;
	const mainAttr = getMainAttribute(node);

	if (mainAttr === 'M') {
		js = valueToString(node[mainAttr]);
	} else if (mainAttr === 'Set') {
		if (node[mainAttr] === null) {
			js = 'x => x';
		} else {
			const paramNames = LAMBDA_PARAMS_NAME.slice(0, node[mainAttr]);
			js = `(x, ${paramNames.join(', ')}) => x`;
		}
	} else {
		const newAttr = mainAttr.split('^')[0];
		js = indent(indentLvl) + newAttr[0].toLowerCase() + newAttr.substring(1);
		if (node[mainAttr] !== null && !SIGNALS_FN.includes(newAttr)) {
			value = getValue(mainAttr, node, indentLvl);
			js += `(${value})`;
		}
	}

	getOtherAttributes(node).forEach((attr) => {
		const newAttr = attr.split('^')[0];
		value = getValue(attr, node, indentLvl);
		js += `${indent(indentLvl + 1)}.${newAttr}(${value})`;
	});

	return js;
}

function transpiler(inputYaml: string): string {
	const tune = yaml.load(inputYaml);
	let outputJs = parseOutro(tune);
	outputJs += `return ${parseNode(tune instanceof Array ? { Stack: tune } : tune)}\n`;
	// eslint-disable-next-line no-console
	console.log(outputJs);
	return outputJs;
}

export default transpiler;
