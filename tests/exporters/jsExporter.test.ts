import { describe, expect, test } from '@jest/globals';

import * as JE from '../../src/exporters/jsExporter';
import { ExporterError } from '../../src/errors';
import { Entry } from '../../src/model';

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

describe('Testing JE.rawNameToFuncName()', () => {
	test('empty strings fails', () => {
		expect(() => JE.rawNameToFuncName('')).toThrow(ExporterError);
	});

	test('prefixes are stripped', () => {
		expect(JE.rawNameToFuncName('.a')).toBe('a');
		expect(JE.rawNameToFuncName('$a')).toBe('a');
	});

	test('suffixes are stripped', () => {
		expect(JE.rawNameToFuncName('a^')).toBe('a');
	});

	test('other strings are kept intact', () => {
		expect(JE.rawNameToFuncName('a')).toBe('a');
	});
});

describe('Testing JE.rawValueToJs()', () => {
	test('common strings are transpiled with quotes', () => {
		expect(JE.rawValueToJs('abc')).toBe("'abc'");
		expect(JE.rawValueToJs('ab\ncd')).toBe('`ab\ncd`');
	});

	test('mini-notation strings are transpiled to a call to mini()', () => {
		expect(JE.rawValueToJs('_abc')).toBe("mini('abc')");
		expect(JE.rawValueToJs('_ab\ncd')).toBe('mini(`ab\ncd`)');
	});

	test('non-string are transpiled without quotes', () => {
		expect(JE.rawValueToJs('2.21')).toBe('2.21');
		expect(JE.rawValueToJs('true')).toBe('true');
		expect(JE.rawValueToJs('false')).toBe('false');
		expect(JE.rawValueToJs('')).toBe('');
	});

	test('expression string are transpiled without quotes, with prefixed variables', () => {
		expect(JE.rawValueToJs('= ab + (42 - cd/2) * 2.21')).toBe('_ab + (42 - _cd/2) * 2.21');
	});

	test('non-valid expression string fails', () => {
		expect(() => JE.rawValueToJs('=$')).toThrow(ExporterError);
	});
});

describe('Testing groupFuncParams()', () => {
	const stringE: Entry = { rawName: '', rawValue: 'a', children: [] };
	const numberE: Entry = { rawName: '', rawValue: '42', children: [] };
	const miniE: Entry = { rawName: '', rawValue: '_a', children: [] };
	const expE: Entry = { rawName: '', rawValue: '=a', children: [] };
	const listE: Entry = { rawName: '', rawValue: '', children: [stringE, numberE] };
	const mainFuncE: Entry = { rawName: 'a', rawValue: '', children: [] };
	const chainedFuncE: Entry = { rawName: '.b', rawValue: 'c', children: [] };
	const mainFuncParamsE: Entry = { rawName: 'a', rawValue: '', children: [stringE, numberE] };
	const chainedFuncParamsE: Entry = { rawName: '.b', rawValue: '', children: [stringE, numberE] };

	test('lists of one item are grouped into one group of one item', () => {
		expect(JE.groupFuncParams([stringE])).toEqual([[stringE]]);
		expect(JE.groupFuncParams([listE])).toEqual([[listE]]);
		expect(JE.groupFuncParams([mainFuncE])).toEqual([[mainFuncE]]);
	});

	test('lists of several items are grouped into groups of one item', () => {
		expect(JE.groupFuncParams([stringE, numberE])).toEqual([[stringE], [numberE]]);
		expect(JE.groupFuncParams([listE, mainFuncE])).toEqual([[listE], [mainFuncE]]);
	});

	test('lists of main/chain functions mix are grouped into groups of main functions', () => {
		expect(JE.groupFuncParams([mainFuncE, chainedFuncE])).toEqual([[mainFuncE, chainedFuncE]]);
		expect(JE.groupFuncParams([mainFuncE, chainedFuncE, stringE, numberE]))
			.toEqual([[mainFuncE, chainedFuncE], [stringE], [numberE]]);
		expect(JE.groupFuncParams([mainFuncE, chainedFuncE, chainedFuncParamsE]))
			.toEqual([[mainFuncE, chainedFuncE, chainedFuncParamsE]]);
		expect(JE.groupFuncParams([mainFuncE, chainedFuncE, mainFuncParamsE, chainedFuncParamsE]))
			.toEqual([[mainFuncE, chainedFuncE], [mainFuncParamsE, chainedFuncParamsE]]);
		expect(JE.groupFuncParams([miniE, chainedFuncE])).toEqual([[miniE, chainedFuncE]]);
		expect(JE.groupFuncParams([expE, chainedFuncE])).toEqual([[expE, chainedFuncE]]);
	});

	// test('serialized parameters are grouped into groups of serialized parameters', () => {
	// 	expect(JE.groupFuncParams([{ a: 1 }, { '.b': 2 }, { _c: 3 }], -2))
	// 		.toEqual([[{ a: 1 }], [{ '.b': 2 }], [{ _c: 3 }]]);
	// 	expect(JE.groupFuncParams([{ a: 1 }, { '.b': 2 }, { _c: 3 }], -1))
	// 		.toEqual([[{ a: 1 }, { '.b': 2 }], [{ _c: 3 }]]);
	// 	expect(JE.groupFuncParams([{ a: 1 }, { '.b': 2 }], 1))
	// 		.toEqual([[{ a: 1 }], [{ '.b': 2 }]]);
	// });

	test('Trying to group bad groups fails', () => {
		expect(() => JE.groupFuncParams([])).toThrow(ExporterError);
		expect(() => JE.groupFuncParams([chainedFuncE])).toThrow(ExporterError);
		expect(() => JE.groupFuncParams([chainedFuncE, mainFuncE])).toThrow(ExporterError);
		expect(() => JE.groupFuncParams([stringE, chainedFuncE])).toThrow(ExporterError);
		expect(() => JE.groupFuncParams([listE, chainedFuncE])).toThrow(ExporterError);
	});
});
