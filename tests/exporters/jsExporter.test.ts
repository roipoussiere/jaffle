import { describe, expect, test } from '@jest/globals';

import * as JE from '../../src/exporters/jsExporter';
import { Vertex, VertexType } from '../../src/dataTypes/vertex';

describe('Testing JE.funcToJs()', () => {
	test('function with literal values are correctly converted', () => {
		const funcTree: Vertex = {
			value: 'a',
			type: VertexType.MainFunc,
			children: [{
				value: 'b',
				type: VertexType.Literal,
				children: [],
			}],
		};
		expect(JE.vertexToJs(funcTree)).toBe("a('b')");
	});
});
