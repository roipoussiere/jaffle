import { describe, expect, test } from '@jest/globals';

import { YamlImporterError, YamlImporter as YI } from '../src/importers/yamlImporter';
import { FuncType, ValueType } from '../src/funcTree';

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
