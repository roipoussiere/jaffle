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
	valueType: ValueType.Object,
	params: [mainFunc, chainedFunc, mainFunc, chainedFunc],
};

describe('Testing YamlImporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => { throw new YamlImporterError('abc'); }).toThrow(YamlImporterError);
	});
});

describe('Testing getValueType()', () => {
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
		expect(YI.getValueType([1, 2, 3])).toBe(ValueType.Object);
		expect(YI.getValueType({ a: 1, b: 2 })).toBe(ValueType.Object);
	});
});

describe('Testing getStringFuncType()', () => {
	test('string func names return string func types', () => {
		expect(YI.getStringFuncType('_abc')).toBe(FuncType.Mininotation);
		expect(YI.getStringFuncType('=abc')).toBe(FuncType.Expression);
		expect(YI.getStringFuncType('$abc')).toBe(FuncType.Constant);
	});

	test('common strings return null', () => {
		expect(YI.getStringFuncType('abc')).toBe(null);
	});
});

describe('Testing getFuncName()', () => {
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

describe('Testing upgradeTree()', () => {
	test('String value have its id and groupId updated', () => {
		const tree = YI.upgradeTree(stringValue);
		expect(tree).toHaveProperty('id', 0);
		expect(tree).toHaveProperty('groupId', 0);
	});

	test('Tree with several function chains have its id and groupId updated', () => {
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
