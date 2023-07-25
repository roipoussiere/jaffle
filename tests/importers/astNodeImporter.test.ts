import { describe, expect, test } from '@jest/globals';

import * as ANI from '../../src/importers/astNodeImporter';
import { AstNode, BoxType, Entry } from '../../src/model';

describe('Testing ANI.getRawName()', () => {
	test('AstNode of value return empty string', () => {
		const input: AstNode = {
			value: 42,
			type: BoxType.Value,
			children: [],
		};
		expect(ANI.getRawName(input)).toBe('');
	});

	test('AstNode of main func return func name', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.MainFunc,
			children: [],
		};
		expect(ANI.getRawName(input)).toBe('a');
	});

	test('AstNode of chained func return func name with chained func prefix', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.ChainedFunc,
			children: [],
		};
		expect(ANI.getRawName(input)).toBe('.a');
	});

	test('AstNode of constant def return func name with constant def prefix', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.ConstantDef,
			children: [],
		};
		expect(ANI.getRawName(input)).toBe('$a');
	});

	test('AstNode of serialized data return func name with serialized data suffix', () => {
		const input: AstNode = {
			value: 'a',
			type: BoxType.SerializedData,
			children: [],
		};
		expect(ANI.getRawName(input)).toBe('a^');
	});
});

describe('Testing ANI.astNodeToEntry()', () => {
	test('AstNode can be used to build Entry', () => {
		const input: AstNode = {
			value: '42',
			type: BoxType.Value,
			children: [],
		};
		const expected: Entry = {
			rawName: '',
			rawValue: '42',
			children: [],
		};
		expect(ANI.astNodeToEntry(input)).toEqual(expected);
	});
});
