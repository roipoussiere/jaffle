import { describe, expect, test } from '@jest/globals';

import * as YE from '../../src/exporters/yamlExporter';
import { Box, BoxType, BoxValueType } from '../../src/dataTypes/box';

describe('Testing YE.boxToYaml()', () => {
	test('function with literal values are correctly converted', () => {
		const input: Box = {
			name: 'a',
			type: BoxType.MainFunc,
			value: 'b',
			valueType: BoxValueType.String,
			children: [],
		};
		expect(YE.boxToYaml(input)).toBe('a: b');
	});

	test('function with params are correctly converted', () => {
		const input: Box = {
			name: 'a',
			type: BoxType.MainFunc,
			value: null,
			valueType: BoxValueType.Empty,
			children: [{
				name: 'b',
				type: BoxType.MainFunc,
				value: 'c',
				valueType: BoxValueType.String,
				children: [],
			}],
		};
		expect(YE.boxToYaml(input)).toBe(`a:
  b: c`);
	});
});
