import { describe, expect, test } from '@jest/globals';

import * as YI from '../../../src/transpilers/yaml/yamlImporter';
import { ImporterError } from '../../../src/errors';
import { Entry } from '../../../src/model';

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
	test('can build serialized entry from key and array', () => {
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

	test('can build serialized entry from key and object', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: '_b',
				rawValue: '1',
				children: [],
			}, {
				rawName: '_c',
				rawValue: 'd',
				children: [],
			}],
		};
		expect(YI.keyValToSerializedEntry('a', { b: 1, c: 'd' })).toEqual(expected);
	});

	test('can build serialized entry from key and literal', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '_b',
			children: [],
		};
		expect(YI.keyValToSerializedEntry('a', '_b')).toEqual(expected);
	});

	test('can build serialized entry from key and null value', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [],
		};
		expect(YI.keyValToSerializedEntry('a', null)).toEqual(expected);
	});
});

describe('Testing YI.valueToSerializedEntry()', () => {
	test('can build serialized entry from array', () => {
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

	test('can build serialized entry from object with unique key', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '1',
			children: [],
		};
		expect(YI.valueToSerializedEntry({ a: 1 })).toEqual(expected);
	});

	test('can build serialized entry from object with several keys', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: '',
			children: [{
				rawName: '_a',
				rawValue: '1',
				children: [],
			}, {
				rawName: '_b',
				rawValue: 'c',
				children: [],
			}],
		};
		expect(YI.valueToSerializedEntry({ a: 1, b: 'c' })).toEqual(expected);
	});

	test('can build serialized entry from literal', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: '42',
			children: [],
		};
		expect(YI.valueToSerializedEntry(42)).toEqual(expected);
	});

	test('can build serialized entry from null value', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: '',
			children: [],
		};
		expect(YI.valueToSerializedEntry(null)).toEqual(expected);
	});
});

describe('Testing YI.buildLiteralEntry()', () => {
	test('can build entry from null value', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: '',
			children: [],
		};
		expect(YI.buildLiteralEntry(null)).toEqual(expected);
	});

	test('can build entry from string value', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: 'foo',
			children: [],
		};
		expect(YI.buildLiteralEntry('foo')).toEqual(expected);
	});

	test('can build entry from number value', () => {
		const expected: Entry = {
			rawName: '',
			rawValue: '42',
			children: [],
		};
		expect(YI.buildLiteralEntry(42)).toEqual(expected);
	});
});

describe('Testing YI.buildListEntry()', () => {
	test('empty list fails', () => {
		expect(() => YI.buildListEntry([])).toThrow(ImporterError);
	});

	test('can build entry from list of literals', () => {
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

describe('Testing YI.buildFuncEntry()', () => {
	test('can build entry from serialized func', () => {
		const expected: Entry = {
			rawName: 'a^',
			rawValue: '_a',
			children: [],
		};
		expect(YI.buildFuncEntry({ 'a^': '_a' })).toEqual(expected);
	});

	test('can build entry from main func with array', () => {
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

	test('bad funcs fails', () => {
		expect(() => YI.buildFuncEntry({})).toThrow(ImporterError);
		expect(() => YI.buildFuncEntry({ a: 1, b: 2 })).toThrow(ImporterError);
	});

	test('can build entry from main func with literal', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};
		expect(YI.buildFuncEntry({ a: 'b' })).toEqual(expected);
	});

	test('can build entry from main func with mininotation', () => {
		const expected: Entry = {
			rawName: 'a',
			rawValue: '_b',
			children: [],
		};
		expect(YI.buildFuncEntry({ a: '_b' })).toEqual(expected);
	});

	test('can build entry from chained func', () => {
		const expected: Entry = {
			rawName: '.a',
			rawValue: '1',
			children: [],
		};
		expect(YI.buildFuncEntry({ '.a': 1 })).toEqual(expected);
	});
});

describe('Testing YI.buildEntryChildren()', () => {
	test('can build entry from lists', () => {
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

	test('can build entry from main and chained funcs', () => {
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

	test('can build entry from literals', () => {
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
