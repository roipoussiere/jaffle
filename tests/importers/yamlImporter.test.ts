import { describe, expect, test } from '@jest/globals';

import * as YI from '../../src/importers/yamlImporter';
import { ImporterError } from '../../src/errors';
import { Entry } from '../../src/model';

describe('Testing YI.getEntryName()', () => {
	test('bad functions fails', () => {
		expect(() => YI.getEntryName({})).toThrow(ImporterError);
		expect(() => YI.getEntryName({ a: 1, b: 2 })).toThrow(ImporterError);
	});

	test('common functions return function name', () => {
		expect(YI.getEntryName({ a: 1 })).toBe('a');
		expect(YI.getEntryName({ _a: 1 })).toBe('_a');
		expect(YI.getEntryName({ $a: 1 })).toBe('$a');
	});
});

describe('Testing YI.keyValToSerializedEntry()', () => {
	test('can build serialized box from key and literal', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '_b',
			children: [],
		};
		expect(YI.keyValToSerializedEntry('a', '_b')).toEqual(expected);
	});

	test('can build serialized box from key and array', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: '',
				rawValue: '1',
				children: [],
			}, {
				rawName: '',
				rawValue: 'b',
				children: [],
			}],
		};
		expect(YI.keyValToSerializedEntry('a', [1, 'b'])).toEqual(expected);
	});

	test('can build serialized box from key and object', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: '1',
				children: [],
			}, {
				rawName: 'c',
				rawValue: 'd',
				children: [],
			}],
		};
		expect(YI.keyValToSerializedEntry('a', { b: 1, c: 'd' })).toEqual(expected);
	});
});

describe('Testing YI.serialize()', () => {
	test('can build serialized box from literal', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: '42',
			children: [],
		};
		expect(YI.valueToSerializedEntry(42)).toEqual(expected);
	});

	test('can build serialized box from array', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: '',
			children: [{
				rawName: '',
				rawValue: '1',
				children: [],
			}, {
				rawName: '',
				rawValue: 'a',
				children: [],
			}],
		};
		expect(YI.valueToSerializedEntry([1, 'a'])).toEqual(expected);
	});

	test('can build serialized box from object with unique key', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '1',
			children: [],
		};
		expect(YI.valueToSerializedEntry({ a: 1 })).toEqual(expected);
	});

	test('can build serialized box from object with several keys', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: '',
			children: [{
				rawName: 'a',
				rawValue: '1',
				children: [],
			}, {
				rawName: 'b',
				rawValue: 'c',
				children: [],
			}],
		};
		expect(YI.valueToSerializedEntry({ a: 1, b: 'c' })).toEqual(expected);
	});
});

describe('Testing YI.buildLiteralBox()', () => {
	test('can build box from literal', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: 'a',
			children: [],
		};
		expect(YI.buildLiteralEntry('a')).toEqual(expected);
	});
});

describe('Testing YI.buildListBox()', () => {
	test('empty lists fails', () => {
		expect(() => YI.buildListEntry([])).toThrow(ImporterError);
	});

	test('can build box from list of literals', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: '',
			children: [{
				rawName: '',
				rawValue: 'true',
				children: [],
			}, {
				rawName: '',
				rawValue: '1',
				children: [],
			}, {
				rawName: '',
				rawValue: 'a',
				children: [],
			}],
		};
		expect(YI.buildListEntry([true, 1, 'a'])).toEqual(expected);
	});
});

describe('Testing YI.buildFuncBox()', () => {
	test('bad funcs fails', () => {
		expect(() => YI.buildFuncEntry({})).toThrow(ImporterError);
		expect(() => YI.buildFuncEntry({ a: 1, b: 2 })).toThrow(ImporterError);
	});

	test('can build box from main func with literal', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};
		expect(YI.buildFuncEntry({ a: 'b' })).toEqual(expected);
	});

	test('can build box from main func with mininotation', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '_b',
			children: [],
		};
		expect(YI.buildFuncEntry({ a: '_b' })).toEqual(expected);
	});

	test('can build box from main func with array', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [
				{
					rawName: '',
					rawValue: '1',
					children: [],
				},
				{
					rawName: '',
					rawValue: '2',
					children: [],
				},
			],
		};
		expect(YI.buildFuncEntry({ a: [1, 2] })).toEqual(expected);
	});

	test('can build box from chained func', () => {
		const expected: Entry = {
			rawName: '.a',
			rawValue: '1',
			children: [],
		};
		expect(YI.buildFuncEntry({ '.a': 1 })).toEqual(expected);
	});

	test('can build box from serialized func', () => {
		const expected: Entry = {
			rawName: 'a^',
			rawValue: '_a',
			children: [],
		};
		expect(YI.buildFuncEntry({ 'a^': '_a' })).toEqual(expected);
	});
});

describe('Testing YI.buildBoxChildren()', () => {
	test('can build boxes from literals', () => {
		const expected: Array<Entry> = [
			{
				rawName: '',
				rawValue: 'true',
				children: [],
			}, {
				rawName: '',
				rawValue: '1',
				children: [],
			}, {
				rawName: '',
				rawValue: 'a',
				children: [],
			},
		];
		expect(YI.buildEntryChildren([true, 1, 'a'])).toEqual(expected);
	});

	test('can build boxes from main and chained funcs', () => {
		const expected: Array<Entry> = [{
			rawName: 'a',
			rawValue: 'true',
			children: [],
		}, {
			rawName: '.b',
			rawValue: '42',
			children: [],
		}, {
			rawName: 'c',
			rawValue: 'd',
			children: [],
		}];
		expect(YI.buildEntryChildren([{ a: true }, { '.b': 42 }, { c: 'd' }])).toEqual(expected);
	});

	test('can build boxes from lists', () => {
		const expected: Array<Entry> = [{
			rawName: '',
			rawValue: '',
			children: [{
				rawName: '',
				rawValue: '',
				children: [],
			}, {
				rawName: '',
				rawValue: 'true',
				children: [],
			}],
		}, {
			rawName: '',
			rawValue: '',
			children: [{
				rawName: '',
				rawValue: '42',
				children: [],
			}, {
				rawName: '',
				rawValue: 'a',
				children: [],
			}],
		}];
		expect(YI.buildEntryChildren([[null, true], [42, 'a']])).toEqual(expected);
	});
});

describe('Testing YI.buildBoxFromYaml()', () => {
	test('non-valid yaml fails', () => {
		expect(() => YI.yamlToEntry('[')).toThrow(ImporterError);
	});

	test('yaml with non-array root element fails', () => {
		expect(() => YI.yamlToEntry('null')).toThrow(ImporterError);
		expect(() => YI.yamlToEntry('true')).toThrow(ImporterError);
		expect(() => YI.yamlToEntry('1')).toThrow(ImporterError);
		expect(() => YI.yamlToEntry('a')).toThrow(ImporterError);
		expect(() => YI.yamlToEntry('{a: 1}')).toThrow(ImporterError);
	});

	test('empty yaml array is well computed', () => {
		const expected: Entry = {
			rawName: 'root',
			rawValue: '',
			children: [],
		};
		expect(YI.yamlToEntry('[]')).toEqual(expected);
	});

	test('non-empty valid yaml is well computed', () => {
		const expected: Entry = {
			rawName: 'root',
			rawValue: '',
			children: [{
				rawName: 'a',
				rawValue: '',
				children: [],
			}, {
				rawName: '.b',
				rawValue: 'true',
				children: [],
			}, {
				rawName: 'c',
				rawValue: '',
				children: [{
					rawName: '',
					rawValue: '42',
					children: [],
				}, {
					rawName: '',
					rawValue: 'd',
					children: [],
				}],
			}],
		};
		expect(YI.yamlToEntry('[{a: }, {.b: true}, {c: [42, d]}]')).toEqual(expected);
	});
});
