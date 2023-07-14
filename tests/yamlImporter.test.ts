import { describe, expect, test } from '@jest/globals';

import { YamlImporterError, YamlImporter as YI } from '../src/importers/yamlImporter';
import { FuncType, ValueType } from '../src/funcTree';

describe('Testing YamlImporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => { throw new YamlImporterError('abc'); }).toThrow(YamlImporterError);
	});
});

describe('Testing getFuncValueType()', () => {
	test('string return string types', () => {
		expect(YI.getFuncValueType('abc')).toBe(ValueType.String);
		expect(YI.getFuncValueType('_abc')).toBe(ValueType.Mininotation);
		expect(YI.getFuncValueType('=abc')).toBe(ValueType.Expression);
	});

	test('other literals return literal types', () => {
		expect(YI.getFuncValueType(null)).toBe(ValueType.Null);
		expect(YI.getFuncValueType(123)).toBe(ValueType.Number);
	});

	test('object return object type', () => {
		expect(YI.getFuncValueType([1, 2, 3])).toBe(ValueType.Object);
		expect(YI.getFuncValueType({ a: 1, b: 2 })).toBe(ValueType.Object);
	});
});
