import { describe, expect, test } from '@jest/globals';

import * as YE from '../../../src/transpilers/yaml/yamlExporter';
import { Entry } from '../../../src/model';

describe('Testing YE.stringToValue()', () => {
	test('string entry is converted to a string', () => {
		expect(YE.stringToValue('foo')).toBe('foo');
	});

	test('number entry is converted to a number', () => {
		expect(YE.stringToValue('42')).toBe(42);
		expect(YE.stringToValue('-2.21')).toBe(-2.21);
	});

	test('boolean entry is converted to a boolean', () => {
		expect(YE.stringToValue('true')).toBeTruthy();
		expect(YE.stringToValue('false')).toBeFalsy();
	});

	test('null entry is converted to null', () => {
		expect(YE.stringToValue('')).toBeNull();
	});
});

describe('Testing YE.dictEntryToDict()', () => {
	test('entry without children is converted to an empty dict', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};
		expect(YE.dictEntryToDict(input)).toEqual({});
	});

	test('dict entry can be converted to a dict', () => {
		const input: Entry = {
			rawName: '',
			rawValue: '',
			children: [{
				rawName: 'a',
				rawValue: '1',
				children: [],
			}, {
				rawName: 'b',
				rawValue: '2',
				children: [],
			}],
		};
		expect(YE.dictEntryToDict(input)).toEqual({ a: 1, b: 2 });
	});
});

describe('Testing YE.entryToObject()', () => {
	test('value entry is converted to the value', () => {
		const input: Entry = {
			rawName: '',
			rawValue: 'foo',
			children: [],
		};
		expect(YE.entryToObject(input)).toBe('foo');
	});

	test('named value entry is converted to a dict', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: 'foo',
			children: [],
		};
		expect(YE.entryToObject(input)).toEqual({ a: 'foo' });
	});

	test('dict entry is converted to a dict', () => {
		const input: Entry = {
			rawName: '',
			rawValue: '',
			children: [{
				rawName: '_b',
				rawValue: '1',
				children: [],
			}, {
				rawName: '_c',
				rawValue: '2',
				children: [],
			}],
		};
		expect(YE.entryToObject(input)).toEqual({ b: 1, c: 2 });
	});

	test('named dict entry is converted to a dict', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: '_b',
				rawValue: '1',
				children: [],
			}, {
				rawName: '_c',
				rawValue: '2',
				children: [],
			}],
		};
		expect(YE.entryToObject(input)).toEqual({ a: { b: 1, c: 2 } });
	});

	test('list entry is converted to a list', () => {
		const input: Entry = {
			rawName: '',
			rawValue: '',
			children: [{
				rawName: 'a',
				rawValue: '1',
				children: [],
			}, {
				rawName: '',
				rawValue: '42',
				children: [],
			}],
		};
		expect(YE.entryToObject(input)).toEqual([{ a: 1 }, 42]);
	});

	test('named list entry is converted to a dict', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: '1',
				children: [],
			}, {
				rawName: '',
				rawValue: '42',
				children: [],
			}],
		};
		expect(YE.entryToObject(input)).toEqual({ a: [{ b: 1 }, 42] });
	});
});

describe('Testing YE.entryToYaml()', () => {
	test('non-root entry is converted to an empty yaml document', () => {
		const input: Entry = {
			rawName: '',
			rawValue: 'foo',
			children: [],
		};
		expect(YE.entryToYaml(input)).toBe('');
	});

	test('root entry with value returns a yaml doc containing the value', () => {
		const input: Entry = {
			rawName: 'root',
			rawValue: 'foo',
			children: [],
		};
		expect(YE.entryToYaml(input)).toBe('foo\n');
	});

	test('root entry with params returns a yaml doc containing the params', () => {
		const input: Entry = {
			rawName: 'root',
			rawValue: '',
			children: [{
				rawName: 'foo',
				rawValue: 'bar',
				children: [],
			}],
		};
		expect(YE.entryToYaml(input)).toBe('- foo: bar\n');
	});
});
