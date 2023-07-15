import { describe, expect, test } from '@jest/globals';

import { YamlImporterError, YamlImporter as YI } from '../src/importers/yamlImporter';
import { FuncType, ValueType } from '../src/funcTree';

const stringValue = {
	id: -1,
	groupId: -1,
	label: '',
	type: FuncType.LiteralValue,
	valueText: 'stringValue',
	valueType: ValueType.String,
	params: [],
};

const mainFunc = {
	id: -1,
	groupId: -1,
	label: 'mainFunc',
	type: FuncType.Main,
	valueText: 'mainFuncValue',
	valueType: ValueType.String,
	params: [],
};

const chainedFunc = {
	id: -1,
	groupId: -1,
	label: '.chainedFunc',
	type: FuncType.Chained,
	valueText: 'chainedFuncValue',
	valueType: ValueType.String,
	params: [],
};

const funcWithChainsInParam = {
	id: -1,
	groupId: -1,
	label: 'funcWithChainsInParam',
	type: FuncType.Main,
	valueText: '',
	valueType: ValueType.Tree,
	params: [mainFunc, chainedFunc, mainFunc, chainedFunc],
};

describe('Testing YamlImporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => { throw new YamlImporterError('abc'); }).toThrow(YamlImporterError);
	});
});

describe('Testing YI.getValueType()', () => {
	test('string return string types', () => {
		expect(YI.getValueType('abc')).toBe(ValueType.String);
		expect(YI.getValueType('_abc')).toBe(ValueType.Mininotation);
		expect(YI.getValueType('=abc')).toBe(ValueType.Expression);
	});

	test('other literals return literal types', () => {
		expect(YI.getValueType(null)).toBe(ValueType.Null);
		expect(YI.getValueType(123)).toBe(ValueType.Number);
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

describe('Testing YI.upgradeTree()', () => {
	test('string value have its id and groupId updated', () => {
		const tree = YI.upgradeTree(stringValue);
		expect(tree).toHaveProperty('id', 0);
		expect(tree).toHaveProperty('groupId', 0);
	});

	test('tree with several function chains have its id and groupId updated', () => {
		const tree = YI.upgradeTree(funcWithChainsInParam);
		expect(tree).toHaveProperty('id', 0);
		expect(tree).toHaveProperty('groupId', 0);
		expect(tree.params[0]).toHaveProperty('id', 1);
		expect(tree.params[0]).toHaveProperty('groupId', 0);
		expect(tree.params[1]).toHaveProperty('id', 2);
		expect(tree.params[1]).toHaveProperty('groupId', 0);
		expect(tree.params[2]).toHaveProperty('id', 3);
		expect(tree.params[2]).toHaveProperty('groupId', 1);
		expect(tree.params[3]).toHaveProperty('id', 4);
		expect(tree.params[3]).toHaveProperty('groupId', 1);
	});
});

describe('Testing YI.computeLiteral()', () => {
	test('string literals are well computed', () => {
		expect(YI.computeLiteral('a')).toEqual({
			id: -1,
			groupId: -1,
			label: '',
			type: FuncType.LiteralValue,
			valueText: 'a',
			valueType: ValueType.String,
			params: [],
		});
	});

	test('number literals are well computed', () => {
		expect(YI.computeLiteral(42)).toEqual({
			id: -1,
			groupId: -1,
			label: '',
			type: FuncType.LiteralValue,
			valueText: '42',
			valueType: ValueType.Number,
			params: [],
		});
	});

	test('null literals are well computed', () => {
		expect(YI.computeLiteral(null)).toEqual({
			id: -1,
			groupId: -1,
			label: '',
			type: FuncType.LiteralValue,
			valueText: '∅',
			valueType: ValueType.Null,
			params: [],
		});
	});

	test('string funcs are well computed', () => {
		expect(YI.computeLiteral('_a')).toEqual({
			id: -1,
			groupId: -1,
			label: '_a',
			type: FuncType.MainMininotation,
			valueText: '',
			valueType: ValueType.Empty,
			params: [],
		});

		expect(YI.computeLiteral('=a')).toEqual({
			id: -1,
			groupId: -1,
			label: '=a',
			type: FuncType.MainExpression,
			valueText: '',
			valueType: ValueType.Empty,
			params: [],
		});
	});
});

describe('Testing YI.serializeEntry()', () => {
	test('literals are well serialized', () => {
		expect(YI.serializeEntry('a', null)).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Serialized,
			valueText: '∅',
			valueType: ValueType.Null,
			params: [],
		});

		expect(YI.serializeEntry('a', 42)).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Serialized,
			valueText: '42',
			valueType: ValueType.Number,
			params: [],
		});

		expect(YI.serializeEntry('a', '_b')).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Serialized,
			valueText: '_b',
			valueType: ValueType.String,
			params: [],
		});
	});

	test('array are well serialized', () => {
		expect(YI.serializeEntry('a', [1, 'a'])).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Serialized,
			valueText: '',
			valueType: ValueType.Tree,
			params: [{
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.Serialized,
				valueText: '1',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.Serialized,
				valueText: 'a',
				valueType: ValueType.String,
				params: [],
			}],
		});
	});

	test('objects are well serialized', () => {
		expect(YI.serializeEntry('a', { b: 1, c: 'd' })).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Serialized,
			valueText: '',
			valueType: ValueType.Tree,
			params: [{
				id: -1,
				groupId: -1,
				label: 'b',
				type: FuncType.Serialized,
				valueText: '1',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: -1,
				groupId: -1,
				label: 'c',
				type: FuncType.Serialized,
				valueText: 'd',
				valueType: ValueType.String,
				params: [],
			}],
		});
	});
});

describe('Testing YI.serialize()', () => {
	test('literals are well serialized', () => {
		expect(YI.serialize(null)).toEqual({
			id: -1,
			groupId: -1,
			label: '',
			type: FuncType.Serialized,
			valueText: '∅',
			valueType: ValueType.Null,
			params: [],
		});

		expect(YI.serialize(42)).toEqual({
			id: -1,
			groupId: -1,
			label: '',
			type: FuncType.Serialized,
			valueText: '42',
			valueType: ValueType.Number,
			params: [],
		});

		expect(YI.serialize('_b')).toEqual({
			id: -1,
			groupId: -1,
			label: '',
			type: FuncType.Serialized,
			valueText: '_b',
			valueType: ValueType.String,
			params: [],
		});
	});

	test('array are well serialized', () => {
		expect(YI.serialize([1, 'a'])).toEqual({
			id: -1,
			groupId: -1,
			label: '[]',
			type: FuncType.Serialized,
			valueText: '',
			valueType: ValueType.Tree,
			params: [{
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.Serialized,
				valueText: '1',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.Serialized,
				valueText: 'a',
				valueType: ValueType.String,
				params: [],
			}],
		});
	});

	test('objects with unique key are well serialized', () => {
		expect(YI.serialize({ a: 1 })).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Serialized,
			valueText: '1',
			valueType: ValueType.Number,
			params: [],
		});
	});

	test('objects several keys are well serialized', () => {
		expect(YI.serialize({ a: 1, b: 'c' })).toEqual({
			id: -1,
			groupId: -1,
			label: '{}',
			type: FuncType.Serialized,
			valueText: '',
			valueType: ValueType.Tree,
			params: [{
				id: -1,
				groupId: -1,
				label: 'a',
				type: FuncType.Serialized,
				valueText: '1',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: -1,
				groupId: -1,
				label: 'b',
				type: FuncType.Serialized,
				valueText: 'c',
				valueType: ValueType.String,
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

	test('main func are well computed', () => {
		expect(YI.computeFunc({ a: null })).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Main,
			valueText: '∅',
			valueType: ValueType.Null,
			params: [],
		});

		expect(YI.computeFunc({ a: 1 })).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Main,
			valueText: '1',
			valueType: ValueType.Number,
			params: [],
		});

		expect(YI.computeFunc({ a: 'b' })).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Main,
			valueText: 'b',
			valueType: ValueType.String,
			params: [],
		});

		expect(YI.computeFunc({ a: '_b' })).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Main,
			valueText: '_b',
			valueType: ValueType.Mininotation,
			params: [],
		});

		expect(YI.computeFunc({ a: '=b' })).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Main,
			valueText: '=b',
			valueType: ValueType.Expression,
			params: [],
		});

		expect(YI.computeFunc({ a: [1, 2] })).toEqual({
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Main,
			valueText: '',
			valueType: ValueType.Tree,
			params: [
				{
					id: -1,
					groupId: -1,
					label: '',
					type: FuncType.LiteralValue,
					valueText: '1',
					valueType: ValueType.Number,
					params: [],
				},
				{
					id: -1,
					groupId: -1,
					label: '',
					type: FuncType.LiteralValue,
					valueText: '2',
					valueType: ValueType.Number,
					params: [],
				},
			],
		});
	});

	test('chained func are well computed', () => {
		expect(YI.computeFunc({ '.a': 1 })).toEqual({
			id: -1,
			groupId: -1,
			label: '.a',
			type: FuncType.Chained,
			valueText: '1',
			valueType: ValueType.Number,
			params: [],
		});
	});

	test('serialized functions are serialized', () => {
		expect(YI.computeFunc({ 'a^': '_a' })).toEqual({
			id: -1,
			groupId: -1,
			label: 'a^',
			type: FuncType.Serialized,
			valueText: '_a',
			valueType: ValueType.String,
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
			id: -1,
			groupId: -1,
			label: '[]',
			type: FuncType.List,
			valueText: '',
			valueType: ValueType.Tree,
			params: [{
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.LiteralValue,
				valueText: 'a',
				valueType: ValueType.String,
				params: [],
			}, {
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.LiteralValue,
				valueText: '1',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.LiteralValue,
				valueText: '∅',
				valueType: ValueType.Null,
				params: [],
			}],
		});
	});
});

describe('Testing YI.computeParams()', () => {
	test('literals are well computed', () => {
		expect(YI.computeParams(['a', 1, null])).toEqual([
			{
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.LiteralValue,
				valueText: 'a',
				valueType: ValueType.String,
				params: [],
			}, {
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.LiteralValue,
				valueText: '1',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.LiteralValue,
				valueText: '∅',
				valueType: ValueType.Null,
				params: [],
			},
		]);
	});

	test('funcs are well computed', () => {
		expect(YI.computeParams([{ a: 1 }, { '.b': 2 }, { c: 3 }, { '.d': 4 }])).toEqual([{
			id: -1,
			groupId: -1,
			label: 'a',
			type: FuncType.Main,
			valueText: '1',
			valueType: ValueType.Number,
			params: [],
		}, {
			id: -1,
			groupId: -1,
			label: '.b',
			type: FuncType.Chained,
			valueText: '2',
			valueType: ValueType.Number,
			params: [],
		}, {
			id: -1,
			groupId: -1,
			label: 'c',
			type: FuncType.Main,
			valueText: '3',
			valueType: ValueType.Number,
			params: [],
		}, {
			id: -1,
			groupId: -1,
			label: '.d',
			type: FuncType.Chained,
			valueText: '4',
			valueType: ValueType.Number,
			params: [],
		}]);
	});

	test('lists are well computed', () => {
		expect(YI.computeParams([[1, 2], [3, 4]])).toEqual([{
			id: -1,
			groupId: -1,
			label: '[]',
			type: FuncType.List,
			valueText: '',
			valueType: ValueType.Tree,
			params: [{
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.LiteralValue,
				valueText: '1',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.LiteralValue,
				valueText: '2',
				valueType: ValueType.Number,
				params: [],
			}],
		}, {
			id: -1,
			groupId: -1,
			label: '[]',
			type: FuncType.List,
			valueText: '',
			valueType: ValueType.Tree,
			params: [{
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.LiteralValue,
				valueText: '3',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: -1,
				groupId: -1,
				label: '',
				type: FuncType.LiteralValue,
				valueText: '4',
				valueType: ValueType.Number,
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
			id: 0,
			groupId: 0,
			type: FuncType.Root,
			label: '',
			valueType: ValueType.Tree,
			valueText: '',
			params: [],
		});
	});

	test('non-empty valid yaml is well computed', () => {
		expect(YI.import('[{a: 1}, {.b: 2}, {c: 3}, {.d: 4}]')).toEqual({
			id: 0,
			groupId: 0,
			type: FuncType.Root,
			label: '',
			valueType: ValueType.Tree,
			valueText: '',
			params: [{
				id: 1,
				groupId: 0,
				label: 'a',
				type: FuncType.Main,
				valueText: '1',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: 2,
				groupId: 0,
				label: '.b',
				type: FuncType.Chained,
				valueText: '2',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: 3,
				groupId: 1,
				label: 'c',
				type: FuncType.Main,
				valueText: '3',
				valueType: ValueType.Number,
				params: [],
			}, {
				id: 4,
				groupId: 1,
				label: '.d',
				type: FuncType.Chained,
				valueText: '4',
				valueType: ValueType.Number,
				params: [],
			}],
		});
	});
});
