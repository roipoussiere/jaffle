import { describe, expect, test } from '@jest/globals';

import * as YI from '../../src/importers/yamlImporter';
import { YamlImporterError } from '../../src/importers/importerErrors';
import { Box, BoxType, BoxValueType } from '../../src/dataTypes/box';

describe('Testing YI.getBoxName()', () => {
	test('bad functions fails', () => {
		expect(() => YI.getBoxName({})).toThrow(YamlImporterError);
		expect(() => YI.getBoxName({ a: 1, b: 2 })).toThrow(YamlImporterError);
	});

	test('common functions return function name', () => {
		expect(YI.getBoxName({ a: 1 })).toBe('a');
		expect(YI.getBoxName({ _a: 1 })).toBe('_a');
		expect(YI.getBoxName({ $a: 1 })).toBe('$a');
	});
});

describe('Testing YI.getBoxType()', () => {
	test('prefixed func names return related func types', () => {
		expect(YI.getBoxType('.abc')).toBe(BoxType.ChainedFunc);
		expect(YI.getBoxType('_abc')).toBe(BoxType.Mininotation);
		expect(YI.getBoxType('=abc')).toBe(BoxType.Expression);
		expect(YI.getBoxType('$abc')).toBe(BoxType.ConstantDef);
	});

	test('func names with serialize suffix return serialized func type', () => {
		expect(YI.getBoxType('abc^')).toBe(BoxType.SerializedData);
	});

	test('common func names return main func type', () => {
		expect(YI.getBoxType('abc')).toBe(BoxType.MainFunc);
	});
});

describe('Testing YI.getBoxValueType()', () => {
	test('literals return literal types', () => {
		expect(YI.getBoxValueType(null)).toBe(BoxValueType.Null);
		expect(YI.getBoxValueType(true)).toBe(BoxValueType.Boolean);
		expect(YI.getBoxValueType('abc')).toBe(BoxValueType.String);
		expect(YI.getBoxValueType(123)).toBe(BoxValueType.Number);
	});

	test('special strings return special string types', () => {
		expect(YI.getBoxValueType('_abc')).toBe(BoxValueType.Mininotation);
		expect(YI.getBoxValueType('=abc')).toBe(BoxValueType.Expression);
	});

	test('objects return empty type', () => {
		expect(YI.getBoxValueType([1, 2, 3])).toBe(BoxValueType.Empty);
		expect(YI.getBoxValueType({ a: 1, b: 2 })).toBe(BoxValueType.Empty);
	});
});

describe('Testing YI.buildSerializedBoxFromKeyVal()', () => {
	test('can build serialized box from key and literal', () => {
		const expected: Box = {
			name: 'a',
			type: BoxType.SerializedData,
			value: '_b',
			valueType: BoxValueType.String,
			children: [],
		};
		expect(YI.buildSerializedBoxFromKeyVal('a', '_b')).toEqual(expected);
	});

	test('can build serialized box from key and array', () => {
		const expected: Box = {
			name: 'a',
			type: BoxType.SerializedData,
			value: null,
			valueType: BoxValueType.Empty,
			children: [{
				name: '',
				type: BoxType.SerializedData,
				value: 1,
				valueType: BoxValueType.Number,
				children: [],
			}, {
				name: '',
				type: BoxType.SerializedData,
				value: 'a',
				valueType: BoxValueType.String,
				children: [],
			}],
		};
		expect(YI.buildSerializedBoxFromKeyVal('a', [1, 'a'])).toEqual(expected);
	});

	test('can build serialized box from key and object', () => {
		const expected: Box = {
			name: 'a',
			type: BoxType.SerializedData,
			value: null,
			valueType: BoxValueType.Empty,
			children: [{
				name: 'b',
				type: BoxType.SerializedData,
				value: 1,
				valueType: BoxValueType.Number,
				children: [],
			}, {
				name: 'c',
				type: BoxType.SerializedData,
				value: 'd',
				valueType: BoxValueType.String,
				children: [],
			}],
		};
		expect(YI.buildSerializedBoxFromKeyVal('a', { b: 1, c: 'd' })).toEqual(expected);
	});
});

describe('Testing YI.serialize()', () => {
	test('can build serialized box from literal', () => {
		const expected: Box = {
			name: '',
			type: BoxType.SerializedData,
			value: 42,
			valueType: BoxValueType.Number,
			children: [],
		};
		expect(YI.buildSerializedBox(42)).toEqual(expected);
	});

	test('can build serialized box from array', () => {
		const expected: Box = {
			name: '',
			type: BoxType.SerializedData,
			value: null,
			valueType: BoxValueType.Empty,
			children: [{
				name: '',
				type: BoxType.SerializedData,
				value: 1,
				valueType: BoxValueType.Number,
				children: [],
			}, {
				name: '',
				type: BoxType.SerializedData,
				value: 'a',
				valueType: BoxValueType.String,
				children: [],
			}],
		};
		expect(YI.buildSerializedBox([1, 'a'])).toEqual(expected);
	});

	test('can build serialized box from object with unique key', () => {
		const expected: Box = {
			name: 'a',
			type: BoxType.SerializedData,
			value: 1,
			valueType: BoxValueType.Number,
			children: [],
		};
		expect(YI.buildSerializedBox({ a: 1 })).toEqual(expected);
	});

	test('can build serialized box from object with several keys', () => {
		const expected: Box = {
			name: '',
			type: BoxType.SerializedData,
			value: null,
			valueType: BoxValueType.Empty,
			children: [{
				name: 'a',
				type: BoxType.SerializedData,
				value: 1,
				valueType: BoxValueType.Number,
				children: [],
			}, {
				name: 'b',
				type: BoxType.SerializedData,
				value: 'c',
				valueType: BoxValueType.String,
				children: [],
			}],
		};
		expect(YI.buildSerializedBox({ a: 1, b: 'c' })).toEqual(expected);
	});
});

describe('Testing YI.buildLiteralBox()', () => {
	test('can build box from literal', () => {
		const expected: Box = {
			name: '',
			type: BoxType.Literal,
			value: 'a',
			valueType: BoxValueType.String,
			children: [],
		};
		expect(YI.buildLiteralBox('a')).toEqual(expected);
	});
});

describe('Testing YI.buildListBox()', () => {
	test('empty lists fails', () => {
		expect(() => YI.buildListBox([])).toThrow(YamlImporterError);
	});

	test('can build box from list of literals', () => {
		const expected: Box = {
			name: '',
			type: BoxType.List,
			value: null,
			valueType: BoxValueType.Empty,
			children: [{
				name: '',
				type: BoxType.Literal,
				value: true,
				valueType: BoxValueType.Boolean,
				children: [],
			}, {
				name: '',
				type: BoxType.Literal,
				value: 1,
				valueType: BoxValueType.Number,
				children: [],
			}, {
				name: '',
				type: BoxType.Literal,
				value: 'a',
				valueType: BoxValueType.String,
				children: [],
			}],
		};
		expect(YI.buildListBox([true, 1, 'a'])).toEqual(expected);
	});
});

describe('Testing YI.buildFuncBox()', () => {
	test('bad funcs fails', () => {
		expect(() => YI.buildFuncBox({})).toThrow(YamlImporterError);
		expect(() => YI.buildFuncBox({ a: 1, b: 2 })).toThrow(YamlImporterError);
	});

	test('can build box from main func with literal', () => {
		const expected: Box = {
			name: 'a',
			type: BoxType.MainFunc,
			value: 'b',
			valueType: BoxValueType.String,
			children: [],
		};
		expect(YI.buildFuncBox({ a: 'b' })).toEqual(expected);
	});

	test('can build box from main func with mininotation', () => {
		const expected: Box = {
			name: 'a',
			type: BoxType.MainFunc,
			value: '_b',
			valueType: BoxValueType.Mininotation,
			children: [],
		};
		expect(YI.buildFuncBox({ a: '_b' })).toEqual(expected);
	});

	test('can build box from main func with array', () => {
		const expected: Box = {
			name: 'a',
			type: BoxType.MainFunc,
			value: null,
			valueType: BoxValueType.Empty,
			children: [
				{
					name: '',
					type: BoxType.Literal,
					value: 1,
					valueType: BoxValueType.Number,
					children: [],
				},
				{
					name: '',
					type: BoxType.Literal,
					value: 2,
					valueType: BoxValueType.Number,
					children: [],
				},
			],
		};
		expect(YI.buildFuncBox({ a: [1, 2] })).toEqual(expected);
	});

	test('can build box from chained func', () => {
		const expected: Box = {
			name: '.a',
			type: BoxType.ChainedFunc,
			value: 1,
			valueType: BoxValueType.Number,
			children: [],
		};
		expect(YI.buildFuncBox({ '.a': 1 })).toEqual(expected);
	});

	test('can build box from serialized func', () => {
		const expected: Box = {
			name: 'a^',
			type: BoxType.SerializedData,
			value: '_a',
			valueType: BoxValueType.String,
			children: [],
		};
		expect(YI.buildFuncBox({ 'a^': '_a' })).toEqual(expected);
	});
});

describe('Testing YI.buildBoxChildren()', () => {
	test('can build boxes from literals', () => {
		const expected: Array<Box> = [
			{
				name: '',
				type: BoxType.Literal,
				value: true,
				valueType: BoxValueType.Boolean,
				children: [],
			}, {
				name: '',
				type: BoxType.Literal,
				value: 1,
				valueType: BoxValueType.Number,
				children: [],
			}, {
				name: '',
				type: BoxType.Literal,
				value: 'a',
				valueType: BoxValueType.String,
				children: [],
			},
		];
		expect(YI.buildBoxChildren([true, 1, 'a'])).toEqual(expected);
	});

	test('can build boxes from main and chained funcs', () => {
		const expected: Array<Box> = [{
			name: 'a',
			type: BoxType.MainFunc,
			value: true,
			valueType: BoxValueType.Boolean,
			children: [],
		}, {
			name: '.b',
			type: BoxType.ChainedFunc,
			value: 42,
			valueType: BoxValueType.Number,
			children: [],
		}, {
			name: 'c',
			type: BoxType.MainFunc,
			value: 'd',
			valueType: BoxValueType.String,
			children: [],
		}];
		expect(YI.buildBoxChildren([{ a: true }, { '.b': 42 }, { c: 'd' }])).toEqual(expected);
	});

	test('can build boxes from lists', () => {
		expect(YI.buildBoxChildren([[null, true], [42, 'a']])).toEqual([{
			name: '',
			type: BoxType.List,
			value: null,
			valueType: BoxValueType.Empty,
			params: [{
				name: '',
				type: BoxType.Literal,
				value: null,
				valueType: BoxValueType.Null,
				params: [],
			}, {
				name: '',
				type: BoxType.Literal,
				value: true,
				valueType: BoxValueType.Boolean,
				params: [],
			}],
		}, {
			name: '',
			type: BoxType.List,
			value: null,
			valueType: BoxValueType.Empty,
			params: [{
				name: '',
				type: BoxType.Literal,
				value: 42,
				valueType: BoxValueType.Number,
				params: [],
			}, {
				name: '',
				type: BoxType.Literal,
				value: 'a',
				valueType: BoxValueType.String,
				params: [],
			}],
		}]);
	});
});

describe('Testing YI.buildBoxFromYaml()', () => {
	test('non-valid yaml fails', () => {
		expect(() => YI.buildBoxFromYaml('[')).toThrow(YamlImporterError);
	});

	test('yaml with non-array root element fails', () => {
		expect(() => YI.buildBoxFromYaml('null')).toThrow(YamlImporterError);
		expect(() => YI.buildBoxFromYaml('true')).toThrow(YamlImporterError);
		expect(() => YI.buildBoxFromYaml('1')).toThrow(YamlImporterError);
		expect(() => YI.buildBoxFromYaml('a')).toThrow(YamlImporterError);
		expect(() => YI.buildBoxFromYaml('{a: 1}')).toThrow(YamlImporterError);
	});

	test('empty yaml array is well computed', () => {
		expect(YI.buildBoxFromYaml('[]')).toEqual({
			name: '',
			type: BoxType.MainFunc,
			value: null,
			valueType: BoxValueType.Empty,
			params: [],
		});
	});

	test('non-empty valid yaml is well computed', () => {
		expect(YI.buildBoxFromYaml('[{a: }, {.b: true}, {c: [42, d]}]')).toEqual({
			name: '',
			type: BoxType.MainFunc,
			value: null,
			valueType: BoxValueType.Empty,
			params: [{
				name: 'a',
				type: BoxType.MainFunc,
				value: null,
				valueType: BoxValueType.Null,
				params: [],
			}, {
				name: '.b',
				type: BoxType.ChainedFunc,
				value: true,
				valueType: BoxValueType.Boolean,
				params: [],
			}, {
				name: 'c',
				type: BoxType.MainFunc,
				value: null,
				valueType: BoxValueType.Empty,
				params: [{
					name: '',
					type: BoxType.Literal,
					value: 42,
					valueType: BoxValueType.Number,
					params: [],
				}, {
					name: '',
					type: BoxType.Literal,
					value: 'd',
					valueType: BoxValueType.String,
					params: [],
				}],
			}],
		});
	});
});
