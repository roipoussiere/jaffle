import { describe, expect, test } from '@jest/globals';

import * as YE from '../../../src/transpilers/yaml/yamlExporter';
import { Entry } from '../../../src/model';

describe('Testing YE.boxToYaml()', () => {
	test('non-root entry is converted to an empty yaml document', () => {
		const input: Entry = {
			rawName: '',
			rawValue: 'foo',
			children: [],
		};
		expect(YE.entryToYaml(input)).toBe('');
	});

	test('root entry with value returns a yaml doc containing the value', () => {
		const input: Entry = {
			rawName: 'root',
			rawValue: 'foo',
			children: [],
		};
		expect(YE.entryToYaml(input)).toBe('foo\n');
	});

	test('root entry with params returns a yaml doc containing the params', () => {
		const input: Entry = {
			rawName: 'root',
			rawValue: '',
			children: [{
				rawName: 'foo',
				rawValue: 'bar',
				children: [],
			}],
		};
		expect(YE.entryToYaml(input)).toBe('- foo: bar\n');
	});
});
