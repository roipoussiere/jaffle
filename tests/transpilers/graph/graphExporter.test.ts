import { describe, expect, test } from '@jest/globals';

import { Box, BoxDisplay, BoxTyping } from '../../../src/transpilers/graph/graphModel';
import { EntryType, Entry, ValueType } from '../../../src/model';
import * as GE from '../../../src/transpilers/graph/graphExporter';

describe('Testing GE.getValueType()', () => {
	test('entry with children -> ValueType.Empty', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: '42',
				children: [],
			}],
		};
		expect(GE.getValueType(input)).toBe(ValueType.Empty);
	});

	test('empty raw value -> ValueType.Null', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [],
		};
		expect(GE.getValueType(input)).toBe(ValueType.Null);
	});

	test('raw value starting with "_" -> ValueType.Mininotation', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '_a',
			children: [],
		};
		expect(GE.getValueType(input)).toBe(ValueType.Mininotation);
	});

	test('raw value starting with "=" -> ValueType.Expression', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '=a',
			children: [],
		};
		expect(GE.getValueType(input)).toBe(ValueType.Expression);
	});

	test('number in raw value -> ValueType.Number', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '42',
			children: [],
		};
		expect(GE.getValueType(input)).toBe(ValueType.Number);
	});

	test('"true" or "false" in raw value -> ValueType.Boolean', () => {
		const inputTrue: Entry = {
			rawName: 'a',
			rawValue: 'true',
			children: [],
		};
		expect(GE.getValueType(inputTrue)).toBe(ValueType.Boolean);

		const inputFalse: Entry = {
			rawName: 'a',
			rawValue: 'false',
			children: [],
		};
		expect(GE.getValueType(inputFalse)).toBe(ValueType.Boolean);
	});

	test('other string in raw value -> ValueType.String', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};
		expect(GE.getValueType(input)).toBe(ValueType.String);
	});
});

describe('Testing GE.isSerialized()', () => {
	test('raw name prefixed with "^" -> true', () => {
		const input: Entry = {
			rawName: 'a^',
			rawValue: 'b',
			children: [],
		};
		expect(GE.isSerialized(input)).toBeTruthy();
	});

	test('raw name not prefixed with "^" -> false', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};
		expect(GE.isSerialized(input)).toBeFalsy();
	});
});

describe('Testing GE.buildBoxTyping()', () => {
	test('Entry without children can be used to build BoxTyping', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '42',
			children: [],
		};
		const expected: BoxTyping = {
			type: EntryType.Function,
			valueType: ValueType.Number,
			isSerialized: false,
			error: false,
		};
		expect(GE.buildBoxTyping(input)).toEqual(expected);
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
			isSerialized: false,
			error: false,
		};
		expect(GE.buildBoxTyping(input)).toEqual(expected);
	});
});

describe('Testing GE.getDisplayValue()', () => {
	test('entry with null value -> "∅"', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [],
		};
		expect(GE.getDisplayValue(input)).toBe('∅');
	});

	test('entry with children -> " "', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: '42',
				children: [],
			}],
		};
		expect(GE.getDisplayValue(input)).toBe(' ');
	});

	test('object entry without value -> " "', () => {
		const input: Entry = {
			rawName: 'A',
			rawValue: '',
			children: [],
		};
		expect(GE.getDisplayValue(input)).toBe(' ');
	});

	test('entry with mininotation value -> stripped raw name', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '_b',
			children: [],
		};
		expect(GE.getDisplayValue(input)).toBe('b');
	});

	test('Entry with expression value -> stripped raw name', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '=b',
			children: [],
		};
		expect(GE.getDisplayValue(input)).toBe('b');
	});

	test('other entries -> raw name', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};
		expect(GE.getDisplayValue(input)).toBe('b');
	});
});

describe('Testing GE.buildBoxDisplay()', () => {
	test('entry without children can be used to build BoxDisplay', () => {
		const input: Entry = {
			rawName: '.a',
			rawValue: '_b',
			children: [],
		};
		const expected: BoxDisplay = {
			displayName: 'a',
			displayValue: 'b',
		};
		expect(GE.buildBoxDisplay(input)).toEqual(expected);
	});

	test('entry with children can be used to build BoxDisplay', () => {
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
		expect(GE.buildBoxDisplay(input)).toEqual(expected);
	});
});

describe('Testing GE.entryToBox()', () => {
	test('entry without children can be used to build Box', () => {
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
			isSerialized: false,
			error: false,

			displayName: 'a',
			displayValue: 'b',

			id: '',
			groupId: 0,
			lastSiblingId: '',

			padding: 2,
			width: 1, // expected because width is updated only on children

			children: [],
		};

		expect(GE.entryToBox(input)).toEqual(expected);
	});

	test('entry with one child can be used to build Box', () => {
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
			isSerialized: false,
			error: false,

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
				isSerialized: false,
				error: false,

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

		expect(GE.entryToBox(input)).toEqual(expected);
	});

	test('entry with func chain as children can be used to build Box', () => {
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
			isSerialized: false,
			error: false,

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
				isSerialized: false,
				error: false,

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
				isSerialized: false,
				error: false,

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
				isSerialized: false,
				error: false,

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

		expect(GE.entryToBox(input)).toEqual(expected);
	});

	test('entry with bad func chain as children builds errored Box', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: '.b',
				rawValue: '123',
				children: [],
			}],
		};

		expect(GE.entryToBox(input).children[0].error).toBeTruthy();
	});
});
