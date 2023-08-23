import { describe, expect, test } from '@jest/globals';

import * as u from '../../src/transpilers/utils';
import { Entry, EntryType } from '../../src/model';

describe('Testing JE.getEntryName()', () => {
	test('dict -> stripped raw name', () => {
		const input = {
			rawName: '_a',
			rawValue: '1',
			children: [],
		};
		expect(u.getEntryName(input)).toBe('a');
	});

	test('non dict -> raw name', () => {
		const input = {
			rawName: 'a',
			rawValue: '1',
			children: [],
		};
		expect(u.getEntryName(input)).toBe('a');
	});
});

describe('Testing u.entryToEntryType()', () => {
	test('list entry return EntryType.List', () => {
		const input: Entry = {
			rawName: '',
			rawValue: '',
			children: [{
				rawName: '',
				rawValue: 'a',
				children: [],
			}, {
				rawName: '',
				rawValue: 'b',
				children: [],
			}],
		};
		expect(u.entryToEntryType(input)).toBe(EntryType.List);
	});

	test('constant def entry return EntryType.ConstantDef', () => {
		const input: Entry = {
			rawName: '$a',
			rawValue: '',
			children: [],
		};
		expect(u.entryToEntryType(input)).toBe(EntryType.ConstantDef);
	});

	test('mininitation value entry return EntryType.MininotationFunction', () => {
		const input: Entry = {
			rawName: '',
			rawValue: '_a',
			children: [],
		};
		expect(u.entryToEntryType(input)).toBe(EntryType.MininotationFunction);
	});

	test('mininitation value entry return EntryType.MininotationFunction', () => {
		const input: Entry = {
			rawName: '',
			rawValue: '=a',
			children: [],
		};
		expect(u.entryToEntryType(input)).toBe(EntryType.ExpressionFunction);
	});

	test('other value entry return EntryType.Value', () => {
		const input: Entry = {
			rawName: '',
			rawValue: 'a',
			children: [],
		};
		expect(u.entryToEntryType(input)).toBe(EntryType.Value);
	});

	test('chained function entry return EntryType.ChainedFunc', () => {
		const input: Entry = {
			rawName: '.a',
			rawValue: '',
			children: [],
		};
		expect(u.entryToEntryType(input)).toBe(EntryType.ChainedFunction);
	});

	test('lambda function entry return EntryType.LambdaFunction', () => {
		const input: Entry = {
			rawName: 'set',
			rawValue: '',
			children: [],
		};
		expect(u.entryToEntryType(input)).toBe(EntryType.LambdaFunction);
	});

	test('function entry return EntryType.Function', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [],
		};
		expect(u.entryToEntryType(input)).toBe(EntryType.Function);
	});

	test('function containing serialized data return EntryType.Function', () => {
		const input: Entry = {
			rawName: 'a^',
			rawValue: '',
			children: [],
		};
		expect(u.entryToEntryType(input)).toBe(EntryType.Function);
	});
});

describe('Testing u.entryToFuncName()', () => {
	test('entry of value return empty string', () => {
		const input: Entry = {
			rawName: '',
			rawValue: '42',
			children: [],
		};
		expect(u.entryToFuncName(input)).toBe('');
	});

	test('entry of chained func return stripped func name', () => {
		const input: Entry = {
			rawName: '.a',
			rawValue: '',
			children: [],
		};
		expect(u.entryToFuncName(input)).toBe('a');
	});

	test('entry of constant def return stripped func name', () => {
		const input: Entry = {
			rawName: '$a',
			rawValue: '',
			children: [],
		};
		expect(u.entryToFuncName(input)).toBe('a');
	});

	test('entry of serialized dict return stripped func name', () => {
		const input: Entry = {
			rawName: '_a',
			rawValue: '',
			children: [],
		};
		expect(u.entryToFuncName(input)).toBe('a');
	});

	test('Entry of serialized data return stripped func name', () => {
		const input: Entry = {
			rawName: 'a^',
			rawValue: '',
			children: [],
		};
		expect(u.entryToFuncName(input)).toBe('a');
	});

	test('entry of main func return func name', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [],
		};
		expect(u.entryToFuncName(input)).toBe('a');
	});
});

describe('Testing u.entryToString()', () => {
	test('entry of value return empty string', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};
		expect(u.entryToString(input)).toBe("'a': 'b'");
	});
});
