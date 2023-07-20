import { describe, expect, test } from '@jest/globals';

import { JsExporterError, JsExporter as JE } from '../../src/exporters/jsExporter';
import { Vertex, VertexType } from '../../src/funcTree';

describe('Testing JsExporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => { throw new JsExporterError('abc'); }).toThrow(JsExporterError);
	});
});

describe('Testing JE.funcToJs()', () => {
	test('function with literal values are correctly converted', () => {
		const funcTree: Vertex = {
			value: 'a',
			type: VertexType.Func,
			children: [{
				value: 'b',
				type: VertexType.Literal,
				children: [],
			}],
		};
		expect(JE.funcToJs(funcTree)).toBe("a('b')");
	});
});
