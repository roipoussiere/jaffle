import { describe, expect, test } from '@jest/globals';

import * as BTI from '../../src/importers/boxTreeImporter';
import { Box, BoxType, BoxValueType } from '../../src/dataTypes/box';
import { Vertex, VertexType } from '../../src/dataTypes/vertex';

describe('Testing BTI.boxToVertex()', () => {
	test('box of main func with literal can be converted to a vertex', () => {
		const input: Box = {
			name: 'a',
			type: BoxType.MainFunc,
			value: 'b',
			valueType: BoxValueType.String,
			children: [],
		};
		const expected: Vertex = {
			type: VertexType.MainFunc,
			value: 'a',
			children: [{
				type: VertexType.Literal,
				value: 'b',
				children: [],
			}],
		};
		expect(BTI.boxToVertex(input)).toEqual(expected);
	});
});
