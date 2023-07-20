import { describe, expect, test } from '@jest/globals';

import { JsExporterError, JsExporter as JE } from '../../src/exporters/jsExporter';
import { FuncTree, FuncType, ValueType } from '../../src/funcTree';

describe('Testing JsExporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => { throw new JsExporterError('abc'); }).toThrow(JsExporterError);
	});
});

describe('Testing JE.funcToJs()', () => {
	test('function with literal values are correctly converted', () => {
		const funcTree: FuncTree = {
			name: 'a',
			type: FuncType.Main,
			value: 'b',
			valueType: ValueType.Literal,
			params: [],
		};
		expect(JE.funcToJs(funcTree)).toBe("a('b')");
	});
});
