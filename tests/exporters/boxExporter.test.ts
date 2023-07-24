import { describe, expect, test } from '@jest/globals';

import * as BE from '../../src/exporters/boxExporter';
import { Box, BoxDisplay, BoxType, BoxTyping, Entry, EntryData, ValueType } from '../../src/model';

describe('Testing BE.getBoxType()', () => {
	test('empty string return BoxType.Value', () => {
		expect(BE.getBoxType('')).toBe(BoxType.Value);
	});

	test('string with chained prefix return BoxType.ChainedFunc', () => {
		expect(BE.getBoxType('.a')).toBe(BoxType.ChainedFunc);
	});

	test('string with constant def prefix return BoxType.ChainedFunc', () => {
		expect(BE.getBoxType('$a')).toBe(BoxType.ConstantDef);
	});

	test('string with serialized sufix return BoxType.SerializedData', () => {
		expect(BE.getBoxType('a^')).toBe(BoxType.SerializedData);
	});

	test('other string return BoxType.MainFunc', () => {
		expect(BE.getBoxType('a')).toBe(BoxType.MainFunc);
	});
});

describe('Testing BE.getBoxValue()', () => {
	test('mininotation string return ValueType.Mininotation', () => {
		expect(BE.getValueType('_a')).toBe(ValueType.Mininotation);
	});

	test('expression string return ValueType.Expression', () => {
		expect(BE.getValueType('=a')).toBe(ValueType.Expression);
	});

	test('string of number return ValueType.Number', () => {
		expect(BE.getValueType('42')).toBe(ValueType.Number);
	});

	test('string of boolean return ValueType.Boolean', () => {
		expect(BE.getValueType('true')).toBe(ValueType.Boolean);
		expect(BE.getValueType('false')).toBe(ValueType.Boolean);
	});

	test('empty string return ValueType.Null', () => {
		expect(BE.getValueType('')).toBe(ValueType.Null);
	});

	test('other string return ValueType.String', () => {
		expect(BE.getValueType('a')).toBe(ValueType.String);
	});
});

describe('Testing BE.buildBoxTyping()', () => {
	test('EntryData can be used to build BoxTyping', () => {
		const input: EntryData = {
			rawName: 'a',
			rawValue: '42',
		};
		const expected: BoxTyping = {
			type: BoxType.MainFunc,
			valueType: ValueType.Number,
		};
		expect(BE.buildBoxTyping(input)).toEqual(expected);
	});
});

describe('Testing BE.getDisplayName()', () => {
	test('prefixes are stripped', () => {
		expect(BE.getDisplayName('.a')).toBe('a');
		expect(BE.getDisplayName('$a')).toBe('a');
	});

	test('suffixes are stripped', () => {
		expect(BE.getDisplayName('a^')).toBe('a');
	});

	test('other string remains same', () => {
		expect(BE.getDisplayName('a')).toBe('a');
	});
});

describe('Testing BE.getDisplayValue()', () => {
	test('prefixes are stripped', () => {
		expect(BE.getDisplayValue('_a')).toBe('a');
		expect(BE.getDisplayValue('=a')).toBe('a');
	});

	test('other string remains same', () => {
		expect(BE.getDisplayValue('a')).toBe('a');
	});
});

describe('Testing BE.buildBoxDisplay()', () => {
	test('EntryData can be used to build BoxDisplay', () => {
		const input: EntryData = {
			rawName: '.a',
			rawValue: '_b',
		};
		const expected: BoxDisplay = {
			displayName: 'a',
			displayValue: 'b',
		};
		expect(BE.buildBoxDisplay(input)).toEqual(expected);
	});
});

describe('Testing BE.entryToBox()', () => {
	test('Entry without children can be used to build Box', () => {
		const input: Entry = {
			rawName: '.a',
			rawValue: '_b',
			children: [],
		};
		const expected: Box = {
			rawName: '.a',
			rawValue: '_b',

			type: BoxType.ChainedFunc,
			valueType: ValueType.Mininotation,

			displayName: 'a',
			displayValue: 'b',

			id: '',
			groupId: 0,

			padding: 2,
			width: 3,

			children: [],
		};
		expect(BE.entryToBox(input)).toEqual(expected);
	});
});
