import { describe, expect, test } from '@jest/globals';

import * as BTI from '../../src/importers/boxTreeImporter';
import { Box, BoxType, BoxValueType } from '../../src/dataTypes/box';
import { Vertex, VertexType } from '../../src/dataTypes/vertex';

describe('Testing BTI.boxToVertex()', () => {
	test('box of literal value can be converted to a vertex', () => {
		const input: Box = {
			name: '',
			type: BoxType.Value,
			value: 'a',
			valueType: BoxValueType.String,
			children: [],
		};

		const expected: Vertex = {
			type: VertexType.Literal,
			value: 'a',
			children: [],
		};

		expect(BTI.boxToVertex(input)).toEqual(expected);
	});

	test('box of mininotation value can be converted to a vertex', () => {
		const input: Box = {
			name: '',
			type: BoxType.Value,
			value: 'a',
			valueType: BoxValueType.Mininotation,
			children: [],
		};

		const expected: Vertex = {
			type: VertexType.MainFunc,
			value: '_mini',
			children: [{
				type: VertexType.Literal,
				value: 'a',
				children: [],
			}],
		};

		expect(BTI.boxToVertex(input)).toEqual(expected);
	});

	test('box of expression value can be converted to a vertex', () => {
		const input: Box = {
			name: '',
			type: BoxType.Value,
			value: 'a',
			valueType: BoxValueType.Expression,
			children: [],
		};

		const expected: Vertex = {
			type: VertexType.MainFunc,
			value: '_expr',
			children: [{
				type: VertexType.Literal,
				value: 'a',
				children: [],
			}],
		};

		expect(BTI.boxToVertex(input)).toEqual(expected);
	});

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

	test('box of main func with params can be converted to a vertex', () => {
		const input: Box = {
			name: 'a',
			type: BoxType.MainFunc,
			value: null,
			valueType: BoxValueType.Empty,
			children: [{
				name: 'b',
				type: BoxType.MainFunc,
				value: true,
				valueType: BoxValueType.Boolean,
				children: [],
			}, {
				name: '.c',
				type: BoxType.ChainedFunc,
				value: 42,
				valueType: BoxValueType.Number,
				children: [],
			}],
		};

		const expected: Vertex = {
			type: VertexType.MainFunc,
			value: 'a',
			children: [{
				type: VertexType.MainFunc,
				value: 'b',
				children: [{
					type: VertexType.Literal,
					value: true,
					children: [],
				}],
			}, {
				type: VertexType.ChainedFunc,
				value: '.c',
				children: [{
					type: VertexType.Literal,
					value: 42,
					children: [],
				}],
			}],
		};

		expect(BTI.boxToVertex(input)).toEqual(expected);
	});
});
