import { describe, expect, test } from '@jest/globals';

import * as BE from '../../src/exporters/boxExporter';
import { Box, BoxDisplay, EntryType, BoxTyping, Entry, ValueType } from '../../src/model';

describe('Testing BE.getBoxValue()', () => {
	test('Entry with mininotation value return ValueType.Mininotation', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '_a',
			children: [],
		};
		expect(BE.getValueType(input)).toBe(ValueType.Mininotation);
	});

	test('Entry with expression value return ValueType.Expression', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '=a',
			children: [],
		};
		expect(BE.getValueType(input)).toBe(ValueType.Expression);
	});

	test('Entry with number value return ValueType.Number', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '42',
			children: [],
		};
		expect(BE.getValueType(input)).toBe(ValueType.Number);
	});

	test('Entry with boolean value return ValueType.Boolean', () => {
		const inputTrue: Entry = {
			rawName: 'a',
			rawValue: 'true',
			children: [],
		};
		expect(BE.getValueType(inputTrue)).toBe(ValueType.Boolean);

		const inputFalse: Entry = {
			rawName: 'a',
			rawValue: 'false',
			children: [],
		};
		expect(BE.getValueType(inputFalse)).toBe(ValueType.Boolean);
	});

	test('Entry with null value return ValueType.Null', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [],
		};
		expect(BE.getValueType(input)).toBe(ValueType.Null);
	});

	test('Entry with string value return ValueType.String', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};
		expect(BE.getValueType(input)).toBe(ValueType.String);
	});

	test('Entry with children return ValueType.Empty', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: '42',
				children: [],
			}],
		};
		expect(BE.getValueType(input)).toBe(ValueType.Empty);
	});
});

describe('Testing BE.buildBoxTyping()', () => {
	test('Entry without children can be used to build BoxTyping', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '42',
			children: [],
		};
		const expected: BoxTyping = {
			type: EntryType.Function,
			valueType: ValueType.Number,
		};
		expect(BE.buildBoxTyping(input)).toEqual(expected);
	});

	test('Entry with children can be used to build BoxTyping', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: '42',
				children: [],
			}],
		};
		const expected: BoxTyping = {
			type: EntryType.Function,
			valueType: ValueType.Empty,
		};
		expect(BE.buildBoxTyping(input)).toEqual(expected);
	});
});

describe('Testing BE.getDisplayValue()', () => {
	test('Entry with string value return the string', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};
		expect(BE.getDisplayValue(input)).toBe('b');
	});

	test('Entry with mininotation value return the stripped string', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '_b',
			children: [],
		};
		expect(BE.getDisplayValue(input)).toBe('b');
	});

	test('Entry with expression value return the stripped string', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '=b',
			children: [],
		};
		expect(BE.getDisplayValue(input)).toBe('b');
	});

	test('Entry with null value return the ∅ symbol', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [],
		};
		expect(BE.getDisplayValue(input)).toBe('∅');
	});

	test('Entry with children return an empty string', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: '42',
				children: [],
			}],
		};
		expect(BE.getDisplayValue(input)).toBe(' ');
	});
});

describe('Testing BE.buildBoxDisplay()', () => {
	test('Entry without children can be used to build BoxDisplay', () => {
		const input: Entry = {
			rawName: '.a',
			rawValue: '_b',
			children: [],
		};
		const expected: BoxDisplay = {
			displayName: 'a',
			displayValue: 'b',
		};
		expect(BE.buildBoxDisplay(input)).toEqual(expected);
	});

	test('Entry with children can be used to build BoxDisplay', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: '42',
				children: [],
			}],
		};
		const expected: BoxDisplay = {
			displayName: 'a',
			displayValue: ' ',
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

			type: EntryType.ChainedFunction,
			valueType: ValueType.Mininotation,

			displayName: 'a',
			displayValue: 'b',

			id: '',
			groupId: 0,
			lastSiblingId: '',

			padding: 2,
			width: 1, // expected because width is updated only on children

			children: [],
		};

		expect(BE.entryToBox(input)).toEqual(expected);
	});

	test('Entry with one child can be used to build Box', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: 'c',
				children: [],
			}],
		};

		const expected: Box = {
			rawName: 'a',
			rawValue: '',

			type: EntryType.Function,
			valueType: ValueType.Empty,

			displayName: 'a',
			displayValue: ' ',

			id: '',
			groupId: 0,
			lastSiblingId: '',

			padding: 2,
			width: 1, // expected because width is updated only on children

			children: [{
				rawName: 'b',
				rawValue: 'c',

				type: EntryType.Function,
				valueType: ValueType.String,

				displayName: 'b',
				displayValue: 'c',

				id: '0',
				groupId: 0,
				lastSiblingId: '0',

				padding: 2,
				width: 3,

				children: [],
			}],
		};

		expect(BE.entryToBox(input)).toEqual(expected);
	});

	test('Entry with several children can be used to build Box', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b123',
				rawValue: 'true',
				children: [],
			},
			{
				rawName: '.c',
				rawValue: '1234567890',
				children: [],
			},
			{
				rawName: 'd',
				rawValue: '',
				children: [],
			}],
		};

		const expected: Box = {
			rawName: 'a',
			rawValue: '',

			type: EntryType.Function,
			valueType: ValueType.Empty,

			displayName: 'a',
			displayValue: ' ',

			id: '',
			groupId: 0,
			lastSiblingId: '',

			padding: 2,
			width: 1, // expected because width is updated only on children

			children: [{
				rawName: 'b123',
				rawValue: 'true',

				type: EntryType.Function,
				valueType: ValueType.Boolean,

				displayName: 'b123',
				displayValue: 'true',

				id: '0',
				groupId: 0,
				lastSiblingId: '1',

				padding: 5,
				width: 15,

				children: [],
			}, {
				rawName: '.c',
				rawValue: '1234567890',

				type: EntryType.ChainedFunction,
				valueType: ValueType.Number,

				displayName: 'c',
				displayValue: '1234567890',

				id: '1',
				groupId: 0,
				lastSiblingId: '1',

				padding: 5,
				width: 15,

				children: [],
			}, {
				rawName: 'd',
				rawValue: '',

				type: EntryType.Function,
				valueType: ValueType.Null,

				displayName: 'd',
				displayValue: '∅',

				id: '2',
				groupId: 1,
				lastSiblingId: '2',

				padding: 2,
				width: 4,

				children: [],
			}],
		};

		expect(BE.entryToBox(input)).toEqual(expected);
	});
});
