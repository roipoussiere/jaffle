import { describe, expect, test } from '@jest/globals';

import * as JE from '../../../src/transpilers/js/jsExporter';
import { ExporterError } from '../../../src/errors';
import { Entry } from '../../../src/model';

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
	rawName: 'j^',
	rawValue: '',
	children: [miniFuncEntry, chainedFuncEntry],
};

const dictEntry: Entry = {
	rawName: 'k',
	rawValue: '',
	children: [{
		rawName: '_l',
		rawValue: '1',
		children: [],
	}, {
		rawName: '_m',
		rawValue: '2',
		children: [],
	}],
};

const namedListEntry: Entry = {
	rawName: 'n',
	rawValue: '',
	children: [strValEntry, numberValEntry],
};

const lambdaFuncEntry: Entry = {
	rawName: 'set',
	rawValue: 'foo',
	children: [mainFuncEntry],
};

const constantDefEntry: Entry = {
	rawName: '$o',
	rawValue: '42',
	children: [],
};

describe('Testing JE.indent()', () => {
	test('code is indented', () => {
		expect(JE.indent(0)).toBe('');
		expect(JE.indent(1)).toBe('\t');
		expect(JE.indent(2)).toBe('\t\t');
	});
});

describe('Testing JE.serializedRawValueToJs()', () => {
	test('"" -> "null"', () => {
		expect(JE.serializedRawValueToJs('')).toBe('null');
	});

	test('number/boolean -> value without quotes', () => {
		expect(JE.serializedRawValueToJs('42')).toBe('42');
		expect(JE.serializedRawValueToJs('-2.21')).toBe('-2.21');
		expect(JE.serializedRawValueToJs('true')).toBe('true');
		expect(JE.serializedRawValueToJs('false')).toBe('false');
	});

	test('other strings -> value with quotes', () => {
		expect(JE.serializedRawValueToJs('foo')).toBe("'foo'");
	});
});

describe('Testing JE.serializedListToJs()', () => {
	test('list of values can be serialized', () => {
		expect(JE.serializedListToJs([miniFuncEntry, strValEntry]).replace(/[\n\t]/g, ''))
			.toBe("['_bar','foo']");
	});
});

describe('Testing JE.serializedDictToJs()', () => {
	test('dict can be serialized', () => {
		expect(JE.serializedDictToJs([mainFuncEntry, mainFuncParamEntry]).replace(/[\n\t]/g, ''))
			.toBe("{'a': null,'b': 42}");
	});

	test('dict within dict can be serialized', () => {
		expect(JE.serializedDictToJs([parentFuncEntry]).replace(/[\n\t]/g, ''))
			.toBe("{'g': {'c': ['foo',42]}}");
	});

	test('list within dict can be serialized', () => {
		expect(JE.serializedDictToJs([namedListEntry]).replace(/[\n\t]/g, ''))
			.toBe("{'n': ['foo',42]}");
	});
});

describe('Testing JE.serializedEntryToJs()', () => {
	test('value entries can be serialized', () => {
		expect(JE.serializedEntryToJs(strValEntry)).toBe("'foo'");
		expect(JE.serializedEntryToJs(numberValEntry)).toBe('42');
		expect(JE.serializedEntryToJs(miniFuncEntry)).toBe("'_bar'");
	});

	test('key-value entries can be serialized', () => {
		expect(JE.serializedEntryToJs(mainFuncParamEntry)).toBe("{ 'b': 42 }");
		expect(JE.serializedEntryToJs(mainFuncEntry)).toBe("{ 'a': null }");
		expect(JE.serializedEntryToJs(mainFuncParamsEntry).replace(/[\n\t]/g, ''))
			.toBe("{'c': ['foo',42]}");
	});

	test('dict entries with key can be serialized', () => {
		expect(JE.serializedEntryToJs(dictEntry).replace(/[\n\t]/g, ''))
			.toBe("{'k': {'l': 1,'m': 2}}");
	});

	test('list entries can be serialized', () => {
		expect(JE.serializedEntryToJs(listEntry).replace(/[\n\t]/g, '')).toBe("['foo',42]");
	});
});

describe('Testing JE.rawValueToJs()', () => {
	test('non-string are transpiled without quotes', () => {
		expect(JE.rawValueToJs('2.21')).toBe('2.21');
		expect(JE.rawValueToJs('true')).toBe('true');
		expect(JE.rawValueToJs('false')).toBe('false');
		expect(JE.rawValueToJs('')).toBe('');
	});

	test('expression string are transpiled without quotes, with prefixed variables', () => {
		expect(JE.rawValueToJs('= ab + (42 - cd/2) * 2.21')).toBe('_ab + (42 - _cd/2) * 2.21');
	});

	test('common strings are transpiled with quotes', () => {
		expect(JE.rawValueToJs('abc')).toBe("'abc'");
		expect(JE.rawValueToJs('_abc')).toBe("'_abc'");
		expect(JE.rawValueToJs('ab\ncd')).toBe('`ab\ncd`');
	});

	test('non-valid expression string fails', () => {
		expect(() => JE.rawValueToJs('=$')).toThrow(ExporterError);
	});
});

describe('Testing lambdaEntryToJs()', () => {
	test('lambda without param can be transpiled', () => {
		expect(JE.lambdaParamsToJs('')).toBe('_x_ => _x_');
	});

	test('lambda with one param can be transpiled', () => {
		expect(JE.lambdaParamsToJs('foo')).toBe('(_x_, _foo) => _x_');
	});

	test('lambda with several params can be transpiled', () => {
		expect(JE.lambdaParamsToJs('foo,bar')).toBe('(_x_, _foo, _bar) => _x_');
	});

	test('lambda with invalid param fails', () => {
		expect(() => JE.lambdaParamsToJs('A')).toThrow(ExporterError);
		expect(() => JE.lambdaParamsToJs('0')).toThrow(ExporterError);
		expect(() => JE.lambdaParamsToJs('$')).toThrow(ExporterError);
	});
});

describe('Testing expandEntry()', () => {
	test('main func with param can be expanded', () => {
		expect(JE.expandEntry(mainFuncParamEntry)).toEqual(expandedMainFuncParamEntry);
	});

	test('mininotation func can be expanded', () => {
		expect(JE.expandEntry(miniFuncEntry)).toEqual(expandedMiniFuncEntry);
	});
});

describe('Testing childEntryToJs()', () => {
	test('value and expression entries can be transpiled', () => {
		expect(JE.childEntryToJs(strValEntry)).toBe("'foo'");
		expect(JE.childEntryToJs(exprFuncEntry)).toBe('_baz');
	});

	test('list entries can be transpiled', () => {
		expect(JE.childEntryToJs(listEntry).replace(/[\n\t]/g, '')).toBe("['foo',42]");
	});

	test('lambda func entries can be transpiled', () => {
		expect(JE.childEntryToJs(lambdaFuncEntry)).toBe('(_x_, _foo) => _x_');
	});

	test('constant defs entries can be transpiled', () => {
		expect(JE.childEntryToJs(constantDefEntry)).toBe('const _o = 42');
	});

	test('object entries can be transpiled', () => {
		expect(JE.childEntryToJs(objectEntry)).toBe('h');
	});

	test('func entries can be transpiled', () => {
		expect(JE.childEntryToJs(miniFuncEntry)).toBe("mini('bar')");
		expect(JE.childEntryToJs(mainFuncEntry)).toBe('a()');
		expect(JE.childEntryToJs(mainFuncParamsEntry)).toBe("c('foo', 42)");
		expect(JE.childEntryToJs(parentFuncEntry).replace(/[\n\t]/g, '')).toBe("g(c('foo', 42))");
	});

	test('chained func entries can be transpiled', () => {
		expect(JE.childEntryToJs(chainFuncParamsEntry).replace(/[\n\t]/g, '')).toBe('f(a().d())');
	});

	test('serialized entries can be transpiled', () => {
		expect(JE.childEntryToJs(serializedFuncEntry).replace(/[\n\t]/g, ''))
			.toBe("j('_bar',{ '.d': null })");
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
	});

	test('trying to group bad groups fails', () => {
		expect(() => JE.groupFuncParams([])).toThrow(ExporterError);
		expect(() => JE.groupFuncParams([mainFuncParamEntry, chainedFuncEntry], 0))
			.toThrow(ExporterError);
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

	test('other params can be transpiled', () => {
		expect(JE.paramsToJsGroups([mainFuncEntry])).toEqual(['a()']);
		expect(JE.paramsToJsGroups([mainFuncParamEntry])).toEqual(['b(42)']);
		expect(JE.paramsToJsGroups([mainFuncEntry, strValEntry])).toEqual(['a()', "'foo'"]);
		expect(JE.paramsToJsGroups([mainFuncParamsEntry])).toEqual(["c('foo', 42)"]);
		expect(JE.paramsToJsGroups([mainFuncEntry, chainedFuncEntry])).toEqual(['a()\n.d()']);
		expect(JE.paramsToJsGroups([mainFuncEntry, chainedFuncEntry, numberValEntry]))
			.toEqual(['a()\n.d()', '42']);
		expect(JE.paramsToJsGroups([mainFuncEntry, chainedFuncEntry, chainedFuncParamsEntry]))
			.toEqual(["a()\n.d()\n.e('foo', 42)"]);
		expect(JE.paramsToJsGroups([mainFuncEntry, chainedFuncEntry,
			mainFuncParamsEntry, chainedFuncParamsEntry]))
			.toEqual(['a()\n.d()', "c('foo', 42)\n.e('foo', 42)"]);
		expect(JE.paramsToJsGroups([parentFuncEntry])).toEqual(["g(\n\tc('foo', 42))"]);
		expect(JE.paramsToJsGroups([mainFuncEntry, objectEntry])).toEqual(['a()', 'h']);
		expect(JE.paramsToJsGroups([mainFuncEntry, chainedObjectEntry])).toEqual(['a()\n.i']);
	});

	test('invalid serialize suffix fails', () => {
		expect(() => JE.paramsToJsGroups([mainFuncEntry], '2')).toThrow(ExporterError);
	});
});

describe('Testing entryToJs()', () => {
	test('entry with children can be transpiled', () => {
		expect(JE.entryToJs(mainFuncParamsEntry)).toBe("'foo';\n\nreturn 42;");
	});

	test('entry with chain func children can be transpiled', () => {
		expect(JE.entryToJs(chainFuncParamsEntry)).toBe('return a()\n.d();');
	});

	test('entry without children fails', () => {
		expect(() => JE.entryToJs(mainFuncParamEntry)).toThrow(ExporterError);
	});
});
