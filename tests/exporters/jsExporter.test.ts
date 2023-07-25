import { describe, expect, test } from '@jest/globals';

import * as JE from '../../src/exporters/jsExporter';
import { AstNode, BoxType } from '../../src/model';

describe('Testing JE.serialize()', () => {
	test('any value can be serialized', () => {
		expect(JE.serialize(null)).toBe('null');
		expect(JE.serialize(true)).toBe('true');
		expect(JE.serialize(42)).toBe('42');
		expect(JE.serialize('abc')).toBe('"abc"');
		expect(JE.serialize([1, 2])).toBe('[1,2]');
		expect(JE.serialize({ a: 1 })).toBe('{"a":1}');
	});
});

describe('Testing JE.astNodeToJs()', () => {
	test('AstNode of number value return js code of the number', () => {
		const input: AstNode = {
			value: 42,
			type: BoxType.Value,
			children: [],
		};
		expect(JE.astNodeToJs(input)).toBe('42');
	});

	test('AstNode of string value return js code of the string', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.Value,
			children: [],
		};
		expect(JE.astNodeToJs(input)).toBe("'a'");
	});

	test('AstNode of main func without param return js code of the function call', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.MainFunc,
			children: [],
		};
		expect(JE.astNodeToJs(input)).toBe('a()');
	});

	test('AstNode of chained func without param return js code of the function call', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.ChainedFunc,
			children: [],
		};
		expect(JE.astNodeToJs(input)).toBe('.a()');
	});

	test('AstNode of func with one param return js code of the function call', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.MainFunc,
			children: [{
				value: 42,
				type: BoxType.Value,
				children: [],
			}],
		};
		expect(JE.astNodeToJs(input)).toBe('a(42)');
	});

	test('AstNode of func with literal params return js code of the function call', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.MainFunc,
			children: [{
				value: true,
				type: BoxType.Value,
				children: [],
			}, {
				value: 42,
				type: BoxType.Value,
				children: [],
			}, {
				value: 'b',
				type: BoxType.Value,
				children: [],
			}],
		};
		expect(JE.astNodeToJs(input)).toBe("a(true, 42, 'b')");
	});

	test('AstNode of func with one func param return js code of the function call', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.MainFunc,
			children: [{
				value: 'b',
				type: BoxType.MainFunc,
				children: [],
			}],
		};
		expect(JE.astNodeToJs(input)).toBe('a(b())');
	});

	test('AstNode of func with several func params return js code of the function call', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.MainFunc,
			children: [{
				value: 'b',
				type: BoxType.MainFunc,
				children: [],
			}, {
				value: 'c',
				type: BoxType.MainFunc,
				children: [],
			}],
		};
		expect(JE.astNodeToJs(input)).toBe('a(b(), c())');
	});

	test('AstNode of func with chained func params return js code of the function call', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.MainFunc,
			children: [{
				value: 'b',
				type: BoxType.MainFunc,
				children: [],
			}, {
				value: 'c',
				type: BoxType.ChainedFunc,
				children: [],
			}],
		};
		expect(JE.astNodeToJs(input)).toBe('a(b().c())');
	});

	test('AstNode of func with chained func params return js code of the function call', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.MainFunc,
			children: [{
				value: 'b',
				type: BoxType.MainFunc,
				children: [],
			}, {
				value: 'c',
				type: BoxType.ChainedFunc,
				children: [],
			}, {
				value: 'd',
				type: BoxType.MainFunc,
				children: [],
			}],
		};
		expect(JE.astNodeToJs(input)).toBe('a(b().c(), d())');
	});
});
