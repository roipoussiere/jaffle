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
});
