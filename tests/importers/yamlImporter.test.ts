import { describe, expect, test } from '@jest/globals';

import { YamlImporterError, YamlImporter as YI } from '../../src/importers/yamlImporter';
import { FuncType, ValueType } from '../../src/funcTree';

describe('Testing YamlImporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => { throw new YamlImporterError('abc'); }).toThrow(YamlImporterError);
	});
});

describe('Testing YI.getValueType()', () => {
	test('special string inputs return special string types', () => {
		expect(YI.getValueType('_abc')).toBe(ValueType.Mininotation);
		expect(YI.getValueType('=abc')).toBe(ValueType.Expression);
	});

	test('literal inputs return literal types', () => {
		expect(YI.getValueType('abc')).toBe(ValueType.Literal);
		expect(YI.getValueType(null)).toBe(ValueType.Literal);
		expect(YI.getValueType(123)).toBe(ValueType.Literal);
	});

	test('object return object type', () => {
		expect(YI.getValueType([1, 2, 3])).toBe(ValueType.Tree);
		expect(YI.getValueType({ a: 1, b: 2 })).toBe(ValueType.Tree);
	});
});

describe('Testing YI.getFuncType()', () => {
	test('prefixed func names return related func types', () => {
		expect(YI.getFuncType('_abc')).toBe(FuncType.MainMininotation);
		expect(YI.getFuncType('$abc')).toBe(FuncType.Constant);
		expect(YI.getFuncType('.abc')).toBe(FuncType.Chained);
	});

	test('func names with serialize suffix return serialized func type', () => {
		expect(YI.getFuncType('abc^')).toBe(FuncType.Serialized);
	});

	test('common func names return main func type', () => {
		expect(YI.getFuncType('abc')).toBe(FuncType.Main);
	});
});

describe('Testing YI.getFuncName()', () => {
	test('bad functions fails', () => {
		expect(() => YI.getFuncName({})).toThrow(YamlImporterError);
		expect(() => YI.getFuncName({ a: 1, b: 2 })).toThrow(YamlImporterError);
	});

	test('common functions return function name', () => {
		expect(YI.getFuncName({ a: 1 })).toBe('a');
		expect(YI.getFuncName({ _a: 1 })).toBe('_a');
		expect(YI.getFuncName({ $a: 1 })).toBe('$a');
	});
});

describe('Testing YI.computeLiteral()', () => {
	test('string literals', () => {
		expect(YI.computeLiteral('a')).toEqual({
			name: '',
			type: FuncType.Literal,
			value: 'a',
			valueType: ValueType.Literal,
			params: [],
		});
	});

	test('number literals', () => {
		expect(YI.computeLiteral(42)).toEqual({
			name: '',
			type: FuncType.Literal,
			value: 42,
			valueType: ValueType.Literal,
			params: [],
		});
	});

	test('null literals', () => {
		expect(YI.computeLiteral(null)).toEqual({
			name: '',
			type: FuncType.Literal,
			value: null,
			valueType: ValueType.Literal,
			params: [],
		});
	});

	test('string funcs are well computed', () => {
		expect(YI.computeLiteral('_a')).toEqual({
			name: '_a',
			type: FuncType.MainMininotation,
			value: '',
			valueType: ValueType.Empty,
			params: [],
		});

		expect(YI.computeLiteral('=a')).toEqual({
			name: '=a',
			type: FuncType.MainExpression,
			value: '',
			valueType: ValueType.Empty,
			params: [],
		});
	});
});

describe('Testing YI.serializeEntry()', () => {
	test('literals', () => {
		expect(YI.serializeEntry('a', null)).toEqual({
			name: 'a',
			type: FuncType.Serialized,
			value: null,
			valueType: ValueType.Literal,
			params: [],
		});

		expect(YI.serializeEntry('a', 42)).toEqual({
			name: 'a',
			type: FuncType.Serialized,
			value: 42,
			valueType: ValueType.Literal,
			params: [],
		});

		expect(YI.serializeEntry('a', '_b')).toEqual({
			name: 'a',
			type: FuncType.Serialized,
			value: '_b',
			valueType: ValueType.Literal,
			params: [],
		});
	});

	test('array are well serialized', () => {
		expect(YI.serializeEntry('a', [1, 'a'])).toEqual({
			name: 'a',
			type: FuncType.Serialized,
			value: '',
			valueType: ValueType.Tree,
			params: [{
				name: '',
				type: FuncType.Serialized,
				value: 1,
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: '',
				type: FuncType.Serialized,
				value: 'a',
				valueType: ValueType.Literal,
				params: [],
			}],
		});
	});

	test('objects are well serialized', () => {
		expect(YI.serializeEntry('a', { b: 1, c: 'd' })).toEqual({
			name: 'a',
			type: FuncType.Serialized,
			value: '',
			valueType: ValueType.Tree,
			params: [{
				name: 'b',
				type: FuncType.Serialized,
				value: 1,
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: 'c',
				type: FuncType.Serialized,
				value: 'd',
				valueType: ValueType.Literal,
				params: [],
			}],
		});
	});
});

describe('Testing YI.serialize()', () => {
	test('literals are well serialized', () => {
		expect(YI.serialize(42)).toEqual({
			name: '',
			type: FuncType.Serialized,
			value: 42,
			valueType: ValueType.Literal,
			params: [],
		});
	});

	test('array are well serialized', () => {
		expect(YI.serialize([1, 'a'])).toEqual({
			name: '',
			type: FuncType.Serialized,
			value: '',
			valueType: ValueType.Tree,
			params: [{
				name: '',
				type: FuncType.Serialized,
				value: 1,
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: '',
				type: FuncType.Serialized,
				value: 'a',
				valueType: ValueType.Literal,
				params: [],
			}],
		});
	});

	test('objects with unique key are well serialized', () => {
		expect(YI.serialize({ a: 1 })).toEqual({
			name: 'a',
			type: FuncType.Serialized,
			value: 1,
			valueType: ValueType.Literal,
			params: [],
		});
	});

	test('objects several keys are well serialized', () => {
		expect(YI.serialize({ a: 1, b: 'c' })).toEqual({
			name: '',
			type: FuncType.Serialized,
			value: '',
			valueType: ValueType.Tree,
			params: [{
				name: 'a',
				type: FuncType.Serialized,
				value: 1,
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: 'b',
				type: FuncType.Serialized,
				value: 'c',
				valueType: ValueType.Literal,
				params: [],
			}],
		});
	});
});

describe('Testing YI.computeFunc()', () => {
	test('bad funcs fails', () => {
		expect(() => YI.computeFunc({})).toThrow(YamlImporterError);
		expect(() => YI.computeFunc({ a: 1, b: 2 })).toThrow(YamlImporterError);
	});

	test('main funcs are well computed', () => {
		expect(YI.computeFunc({ a: null })).toEqual({
			name: 'a',
			type: FuncType.Main,
			value: null,
			valueType: ValueType.Literal,
			params: [],
		});

		expect(YI.computeFunc({ a: 1 })).toEqual({
			name: 'a',
			type: FuncType.Main,
			value: 1,
			valueType: ValueType.Literal,
			params: [],
		});

		expect(YI.computeFunc({ a: 'b' })).toEqual({
			name: 'a',
			type: FuncType.Main,
			value: 'b',
			valueType: ValueType.Literal,
			params: [],
		});

		expect(YI.computeFunc({ a: '_b' })).toEqual({
			name: 'a',
			type: FuncType.Main,
			value: '_b',
			valueType: ValueType.Mininotation,
			params: [],
		});

		expect(YI.computeFunc({ a: '=b' })).toEqual({
			name: 'a',
			type: FuncType.Main,
			value: '=b',
			valueType: ValueType.Expression,
			params: [],
		});

		expect(YI.computeFunc({ a: [1, 2] })).toEqual({
			name: 'a',
			type: FuncType.Main,
			value: '',
			valueType: ValueType.Tree,
			params: [
				{
					name: '',
					type: FuncType.Literal,
					value: 1,
					valueType: ValueType.Literal,
					params: [],
				},
				{
					name: '',
					type: FuncType.Literal,
					value: 2,
					valueType: ValueType.Literal,
					params: [],
				},
			],
		});
	});

	test('chained func are well computed', () => {
		expect(YI.computeFunc({ '.a': 1 })).toEqual({
			name: '.a',
			type: FuncType.Chained,
			value: 1,
			valueType: ValueType.Literal,
			params: [],
		});
	});

	test('serialized functions are serialized', () => {
		expect(YI.computeFunc({ 'a^': '_a' })).toEqual({
			name: 'a^',
			type: FuncType.Serialized,
			value: '_a',
			valueType: ValueType.Literal,
			params: [],
		});
	});
});

describe('Testing YI.computeList()', () => {
	test('empty lists fails', () => {
		expect(() => YI.computeList([])).toThrow(YamlImporterError);
	});

	test('lists are well computed', () => {
		expect(YI.computeList(['a', 1, null])).toEqual({
			name: '',
			type: FuncType.List,
			value: '',
			valueType: ValueType.Tree,
			params: [{
				name: '',
				type: FuncType.Literal,
				value: 'a',
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: '',
				type: FuncType.Literal,
				value: 1,
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: '',
				type: FuncType.Literal,
				value: null,
				valueType: ValueType.Literal,
				params: [],
			}],
		});
	});
});

describe('Testing YI.computeParams()', () => {
	test('literals are well computed', () => {
		expect(YI.computeParams(['a', 1, null])).toEqual([
			{
				name: '',
				type: FuncType.Literal,
				value: 'a',
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: '',
				type: FuncType.Literal,
				value: 1,
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: '',
				type: FuncType.Literal,
				value: null,
				valueType: ValueType.Literal,
				params: [],
			},
		]);
	});

	test('funcs are well computed', () => {
		expect(YI.computeParams([{ a: null }, { '.b': 42 }, { c: 'd' }, { '.d': 'f' }])).toEqual([{
			name: 'a',
			type: FuncType.Main,
			value: null,
			valueType: ValueType.Literal,
			params: [],
		}, {
			name: '.b',
			type: FuncType.Chained,
			value: 42,
			valueType: ValueType.Literal,
			params: [],
		}, {
			name: 'c',
			type: FuncType.Main,
			value: 'd',
			valueType: ValueType.Literal,
			params: [],
		}, {
			name: '.d',
			type: FuncType.Chained,
			value: 'f',
			valueType: ValueType.Literal,
			params: [],
		}]);
	});

	test('lists are well computed', () => {
		expect(YI.computeParams([[null, 42], ['a', 'b']])).toEqual([{
			name: '',
			type: FuncType.List,
			value: '',
			valueType: ValueType.Tree,
			params: [{
				name: '',
				type: FuncType.Literal,
				value: null,
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: '',
				type: FuncType.Literal,
				value: 42,
				valueType: ValueType.Literal,
				params: [],
			}],
		}, {
			name: '',
			type: FuncType.List,
			value: '',
			valueType: ValueType.Tree,
			params: [{
				name: '',
				type: FuncType.Literal,
				value: 'a',
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: '',
				type: FuncType.Literal,
				value: 'b',
				valueType: ValueType.Literal,
				params: [],
			}],
		}]);
	});
});

describe('Testing YI.import()', () => {
	test('non-valid yaml fails', () => {
		expect(() => YI.import('[')).toThrow(YamlImporterError);
	});

	test('yaml with non-array root element fails', () => {
		expect(() => YI.import('null')).toThrow(YamlImporterError);
		expect(() => YI.import('1')).toThrow(YamlImporterError);
		expect(() => YI.import('a')).toThrow(YamlImporterError);
		expect(() => YI.import('{a: 1}')).toThrow(YamlImporterError);
	});

	test('empty yaml is well computed', () => {
		expect(YI.import('[]')).toEqual({
			name: '',
			type: FuncType.Main,
			value: '',
			valueType: ValueType.Tree,
			params: [],
		});
	});

	test('non-empty valid yaml is well computed', () => {
		expect(YI.import('[{a: }, {.b: 42}, {c: foo}, {.d: [1, 2]}]')).toEqual({
			name: '',
			type: FuncType.Main,
			value: '',
			valueType: ValueType.Tree,
			params: [{
				name: 'a',
				type: FuncType.Main,
				value: null,
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: '.b',
				type: FuncType.Chained,
				value: 42,
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: 'c',
				type: FuncType.Main,
				value: 'foo',
				valueType: ValueType.Literal,
				params: [],
			}, {
				name: '.d',
				type: FuncType.Chained,
				value: '',
				valueType: ValueType.Tree,
				params: [{
					name: '',
					type: FuncType.Literal,
					value: 1,
					valueType: ValueType.Literal,
					params: [],
				}, {
					name: '',
					type: FuncType.Literal,
					value: 2,
					valueType: ValueType.Literal,
					params: [],
				}],
			}],
		});
	});
});
