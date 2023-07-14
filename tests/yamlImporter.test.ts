import { describe, expect, test } from '@jest/globals';

// import * as e from '../src/errors';
import { YamlImporterError, YamlImporter as yi } from '../src/importers/yamlImporter';
import { FuncType, ValueType } from '../src/funcTree';

describe('Testing YamlImporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => new YamlImporterError('abc')).toThrow(YamlImporterError);
	});
});

describe('Testing getFuncValueType()', () => {
	test('string return string types', () => {
		expect(yi.getFuncValueType('abc')).toBe(ValueType.String);
		expect(yi.getFuncValueType('_abc')).toBe(ValueType.Mininotation);
		expect(yi.getFuncValueType('=abc')).toBe(ValueType.Expression);
	});

	test('other literals return literal types', () => {
		expect(yi.getFuncValueType(null)).toBe(ValueType.Null);
		expect(yi.getFuncValueType(123)).toBe(ValueType.Number);
	});

	test('object return object type', () => {
		expect(yi.getFuncValueType([1, 2, 3])).toBe(ValueType.Object);
		expect(yi.getFuncValueType({ a: 1, b: 2 })).toBe(ValueType.Object);
	});
});
