import { describe, expect, test } from '@jest/globals';

import * as ANE from '../../src/exporters/astNodeExporter';
import { Entry, AstNode, BoxType, AstNodeData } from '../../src/model';

describe('Testing ANE.rawNameToBoxType()', () => {
	test('string with chained func prefix return BoxType.ChainedFunc', () => {
		expect(ANE.rawNameToBoxType('.a')).toBe(BoxType.ChainedFunc);
	});

	test('string with constant def prefix return BoxType.ConstantDef', () => {
		expect(ANE.rawNameToBoxType('$a')).toBe(BoxType.ConstantDef);
	});

	test('string with serialized func suffix return BoxType.SerializedData', () => {
		expect(ANE.rawNameToBoxType('a^')).toBe(BoxType.SerializedData);
	});

	test('empty string return BoxType.Value', () => {
		expect(ANE.rawNameToBoxType('')).toBe(BoxType.Value);
	});

	test('other string return BoxType.MainFunc', () => {
		expect(ANE.rawNameToBoxType('a')).toBe(BoxType.MainFunc);
	});

	// expect(ANE.rawNameToBoxType('')).toBe(BoxType.List); // ???
});

describe('Testing ANE.rawValueToValue()', () => {
	test('empty string return null', () => {
		expect(ANE.rawValueToValue('')).toBe(null);
	});

	test('string of number return a number', () => {
		expect(ANE.rawValueToValue('123')).toBe(123);
	});

	test('string of boolean return a boolean', () => {
		expect(ANE.rawValueToValue('true')).toBe(true);
		expect(ANE.rawValueToValue('false')).toBe(false);
	});

	test('other string return the string', () => {
		expect(ANE.rawValueToValue('a')).toBe('a');
	});
});

describe('Testing ANE.entryToAstNodeData()', () => {
	test('Entry of value can be used to build AstNodeData', () => {
		const input: Entry = {
			rawName: '',
			rawValue: '42',
			children: [],
		};
		const expected: AstNodeData = {
			value: 42,
			type: BoxType.Value,
		};
		expect(ANE.entryToAstNodeData(input)).toEqual(expected);
	});

	test('Entry of main func can be used to build AstNodeData', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '42',
			children: [],
		};
		const expected: AstNodeData = {
			value: 'a',
			type: BoxType.MainFunc,
		};
		expect(ANE.entryToAstNodeData(input)).toEqual(expected);
	});
});

describe('Testing ANE.entryToAstNode()', () => {
	test('Entry of value can be used to build AstNode', () => {
		const input: Entry = {
			rawName: '',
			rawValue: '42',
			children: [],
		};
		const expected: AstNode = {
			value: 42,
			type: BoxType.Value,
			children: [],
		};
		expect(ANE.entryToAstNode(input)).toEqual(expected);
	});

	test('Entry of main func can be used to build AstNode', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '42',
			children: [],
		};
		const expected: AstNode = {
			value: 'a',
			type: BoxType.MainFunc,
			children: [{
				value: 42,
				type: BoxType.Value,
				children: [],
			}],
		};
		expect(ANE.entryToAstNode(input)).toEqual(expected);
	});
});
