import { describe, expect, test } from '@jest/globals';

import * as YE from '../../src/exporters/yamlExporter';
import { Entry } from '../../src/model';

describe('Testing YE.boxToYaml()', () => {
	test('function with literal values are correctly converted', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};
		expect(YE.entryToYaml(input)).toBe('a: b\n');
	});

	test('function with params are correctly converted', () => {
		const input: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: 'c',
				children: [],
			}],
		};
		expect(YE.entryToYaml(input)).toBe('a:\n  - b: c\n');
	});
});
