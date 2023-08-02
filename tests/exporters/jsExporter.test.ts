import { describe, expect, test } from '@jest/globals';

import * as JE from '../../src/exporters/jsExporter';
import { ExporterError } from '../../src/errors';
import { Entry } from '../../src/model';

const strValEntry: Entry = {
	rawName: '',
	rawValue: 'foo',
	children: [],
};

const numberValEntry: Entry = {
	rawName: '',
	rawValue: '42',
	children: [],
};

const miniFuncEntry: Entry = {
	rawName: '',
	rawValue: '_bar',
	children: [],
};

const expandedMiniFuncEntry: Entry = {
	rawName: 'mini',
	rawValue: '',
	children: [{
		rawName: '',
		rawValue: 'bar',
		children: [],
	}],
};

const exprFuncEntry: Entry = {
	rawName: '',
	rawValue: '=baz',
	children: [],
};

const listEntry: Entry = {
	rawName: '',
	rawValue: '',
	children: [strValEntry, numberValEntry],
};

const mainFuncEntry: Entry = {
	rawName: 'a',
	rawValue: '',
	children: [],
};

const mainFuncParamEntry: Entry = {
	rawName: 'b',
	rawValue: '42',
	children: [],
};

const expandedMainFuncParamEntry: Entry = {
	rawName: 'b',
	rawValue: '',
	children: [{
		rawName: '',
		rawValue: '42',
		children: [],
	}],
};

const mainFuncParamsEntry: Entry = {
	rawName: 'c',
	rawValue: '',
	children: [strValEntry, numberValEntry],
};

const chainedFuncEntry: Entry = {
	rawName: '.d',
	rawValue: '',
	children: [],
};

const chainedFuncParamsEntry: Entry = {
	rawName: '.e',
	rawValue: '',
	children: [strValEntry, numberValEntry],
};

const chainFuncParamsEntry: Entry = {
	rawName: 'f',
	rawValue: '',
	children: [mainFuncEntry, chainedFuncEntry],
};

const parentFuncEntry: Entry = {
	rawName: 'g',
	rawValue: '',
	children: [mainFuncParamsEntry],
};

const objectEntry: Entry = {
	rawName: 'H',
	rawValue: '',
	children: [],
};

const chainedObjectEntry: Entry = {
	rawName: '.I',
	rawValue: '',
	children: [],
};

const serializedFuncEntry: Entry = {
	rawName: 'a^',
	rawValue: '',
	children: [miniFuncEntry, chainedFuncEntry],
};

describe('Testing JE.serializedEntryToJs()', () => {
	test('any value can be serialized', () => {
		expect(JE.serializedEntryToJs(strValEntry)).toBe("'foo'");
		expect(JE.serializedEntryToJs(numberValEntry)).toBe('42');
		expect(JE.serializedEntryToJs(miniFuncEntry)).toBe("'_bar'");
		expect(JE.serializedEntryToJs(listEntry)).toBe("['foo',\n42]");
		expect(JE.serializedEntryToJs(mainFuncEntry)).toBe("{'a': null}");
		expect(JE.serializedEntryToJs(mainFuncParamEntry)).toBe("{'b': 42}");
		expect(JE.serializedEntryToJs(mainFuncParamsEntry)).toBe("{'c': ['foo',\n42]}");
	});
});

describe('Testing JE.rawValueToJs()', () => {
	test('common strings are transpiled with quotes', () => {
		expect(JE.rawValueToJs('abc')).toBe("'abc'");
		expect(JE.rawValueToJs('_abc')).toBe("'_abc'");
		expect(JE.rawValueToJs('ab\ncd')).toBe('`ab\ncd`');
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

describe('Testing lambdaEntryToJs()', () => {
	test('', () => {
		expect(JE.lambdaParamsToJs('')).toBe('_x_ => _x_');
		expect(() => JE.lambdaParamsToJs('A')).toThrow(ExporterError);
		expect(() => JE.lambdaParamsToJs('0')).toThrow(ExporterError);
		expect(() => JE.lambdaParamsToJs('$')).toThrow(ExporterError);
		expect(JE.lambdaParamsToJs('foo')).toBe('(_x_, _foo) => _x_');
		expect(JE.lambdaParamsToJs('foo,bar')).toBe('(_x_, _foo, _bar) => _x_');
	});
});

describe('Testing childEntryToJs()', () => {
	test('', () => {
		expect(JE.childEntryToJs(strValEntry)).toBe("'foo'");
		expect(JE.childEntryToJs(numberValEntry)).toBe('42');
		expect(JE.childEntryToJs(miniFuncEntry)).toBe("mini('bar')");
		expect(JE.childEntryToJs(exprFuncEntry)).toBe('_baz');
		expect(JE.childEntryToJs(listEntry)).toBe("['foo',\n42]");
		expect(JE.childEntryToJs(mainFuncEntry)).toBe('a()');
		expect(JE.childEntryToJs(mainFuncParamsEntry)).toBe("c(\n'foo',\n42)");
		expect(JE.childEntryToJs(parentFuncEntry)).toBe("g(c(\n    'foo',\n    42))");
		expect(JE.childEntryToJs(chainFuncParamsEntry)).toBe('f(\na()\n  .d())');
		expect(JE.childEntryToJs(objectEntry)).toBe('h');
		expect(JE.childEntryToJs(serializedFuncEntry)).toBe("a(\n'_bar',\n{'.d': null})");
	});
});

describe('Testing groupFuncParams()', () => {
	test('lists of one item are grouped into one group of one item', () => {
		expect(JE.groupFuncParams([strValEntry])).toEqual([[strValEntry]]);
		expect(JE.groupFuncParams([listEntry])).toEqual([[listEntry]]);
		expect(JE.groupFuncParams([mainFuncEntry])).toEqual([[mainFuncEntry]]);
	});

	test('lists of several items are grouped into groups of one item', () => {
		expect(JE.groupFuncParams([strValEntry, numberValEntry]))
			.toEqual([[strValEntry], [numberValEntry]]);
		expect(JE.groupFuncParams([listEntry, mainFuncEntry]))
			.toEqual([[listEntry], [mainFuncEntry]]);
	});

	test('lists of main/chain functions mix are grouped into groups of main functions', () => {
		expect(JE.groupFuncParams([mainFuncEntry, chainedFuncEntry]))
			.toEqual([[mainFuncEntry, chainedFuncEntry]]);
		expect(JE.groupFuncParams([mainFuncEntry, chainedFuncEntry], -1))
			.toEqual([[mainFuncEntry, chainedFuncEntry]]);
		expect(JE.groupFuncParams([mainFuncEntry, chainedFuncEntry, strValEntry, numberValEntry]))
			.toEqual([[mainFuncEntry, chainedFuncEntry], [strValEntry], [numberValEntry]]);
		expect(JE.groupFuncParams([mainFuncEntry, chainedFuncEntry, chainedFuncParamsEntry]))
			.toEqual([[mainFuncEntry, chainedFuncEntry, chainedFuncParamsEntry]]);
		expect(JE.groupFuncParams([mainFuncEntry, chainedFuncEntry,
			mainFuncParamsEntry, chainedFuncParamsEntry]))
			.toEqual([[mainFuncEntry, chainedFuncEntry],
				[mainFuncParamsEntry, chainedFuncParamsEntry]]);
		expect(JE.groupFuncParams([miniFuncEntry, chainedFuncEntry]))
			.toEqual([[expandedMiniFuncEntry, chainedFuncEntry]]);
		expect(JE.groupFuncParams([exprFuncEntry, chainedFuncEntry]))
			.toEqual([[exprFuncEntry, chainedFuncEntry]]);
		expect(JE.groupFuncParams([mainFuncParamEntry, chainedFuncEntry, miniFuncEntry]))
			.toEqual([[expandedMainFuncParamEntry, chainedFuncEntry], [expandedMiniFuncEntry]]);
		expect(JE.groupFuncParams([mainFuncEntry, objectEntry]))
			.toEqual([[mainFuncEntry], [objectEntry]]);
		expect(JE.groupFuncParams([mainFuncEntry, chainedObjectEntry]))
			.toEqual([[mainFuncEntry, chainedObjectEntry]]);
	});

	test('serialized parameters are grouped into groups of serialized parameters', () => {
		expect(JE.groupFuncParams([mainFuncParamEntry, chainedFuncEntry, miniFuncEntry], -2))
			.toEqual([[mainFuncParamEntry], [chainedFuncEntry], [miniFuncEntry]]);
		expect(JE.groupFuncParams([mainFuncParamEntry, chainedFuncEntry], 1))
			.toEqual([[expandedMainFuncParamEntry], [chainedFuncEntry]]);
		expect(() => JE.groupFuncParams([mainFuncParamEntry, chainedFuncEntry], 0))
			.toThrow(ExporterError);
	});

	test('Trying to group bad groups fails', () => {
		expect(() => JE.groupFuncParams([])).toThrow(ExporterError);
		expect(() => JE.groupFuncParams([chainedFuncEntry])).toThrow(ExporterError);
		expect(() => JE.groupFuncParams([chainedFuncEntry, mainFuncEntry])).toThrow(ExporterError);
		expect(() => JE.groupFuncParams([strValEntry, chainedFuncEntry])).toThrow(ExporterError);
		expect(() => JE.groupFuncParams([listEntry, chainedFuncEntry])).toThrow(ExporterError);
	});
});

describe('Testing paramsToJsGroups()', () => {
	test('empty params return empty array', () => {
		expect(JE.paramsToJsGroups([])).toEqual([]);
	});

	test('empty params return empty array', () => {
		expect(JE.paramsToJsGroups([mainFuncEntry])).toEqual(['a()']);
		expect(JE.paramsToJsGroups([mainFuncParamEntry])).toEqual(['b(42)']);
		expect(JE.paramsToJsGroups([mainFuncEntry, strValEntry])).toEqual(['a()', "'foo'"]);
		expect(JE.paramsToJsGroups([mainFuncParamsEntry])).toEqual(["c(\n  'foo',\n  42)"]);
		expect(JE.paramsToJsGroups([mainFuncEntry, chainedFuncEntry])).toEqual(['a()\n.d()']);
		expect(JE.paramsToJsGroups([mainFuncEntry, chainedFuncEntry, numberValEntry]))
			.toEqual(['a()\n.d()', '42']);
		expect(JE.paramsToJsGroups([mainFuncEntry, chainedFuncEntry, chainedFuncParamsEntry]))
			.toEqual(["a()\n.d()\n.e(\n  'foo',\n  42)"]);
		expect(JE.paramsToJsGroups([mainFuncEntry, chainedFuncEntry,
			mainFuncParamsEntry, chainedFuncParamsEntry]))
			.toEqual(['a()\n.d()', "c(\n  'foo',\n  42)\n.e(\n  'foo',\n  42)"]);
		expect(JE.paramsToJsGroups([parentFuncEntry])).toEqual(["g(c(\n      'foo',\n      42))"]);
		expect(JE.paramsToJsGroups([mainFuncEntry, objectEntry])).toEqual(['a()', 'h']);
		expect(JE.paramsToJsGroups([mainFuncEntry, chainedObjectEntry])).toEqual(['a()\n.i']);
	});
});
