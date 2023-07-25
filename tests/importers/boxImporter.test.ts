import { describe, expect, test } from '@jest/globals';

import * as BI from '../../src/importers/boxImporter';
import { Box, BoxType, Entry, ValueType } from '../../src/model';

describe('Testing BI.boxToEntry()', () => {
	test('box without children can be converted to an Entry', () => {
		const input: Box = {
			rawName: 'a',
			rawValue: 'b',
			type: BoxType.MainFunc,
			valueType: ValueType.String,
			id: '',
			groupId: 0,
			lastSiblingId: '',
			displayName: 'a',
			displayValue: 'b',
			padding: 2,
			width: 3,
			children: [],
		};

		const expected: Entry = {
			rawName: 'a',
			rawValue: 'b',
			children: [],
		};

		expect(BI.boxToEntry(input)).toEqual(expected);
	});

	test('box with children can be converted to an Entry', () => {
		const child: Box = {
			rawName: 'b',
			rawValue: 'c',
			type: BoxType.MainFunc,
			valueType: ValueType.String,
			id: '0',
			groupId: 0,
			lastSiblingId: '',
			displayName: 'b',
			displayValue: 'c',
			padding: 2,
			width: 3,
			children: [],
		};

		const input: Box = {
			rawName: 'a',
			rawValue: '',
			type: BoxType.MainFunc,
			valueType: ValueType.String,
			id: '',
			groupId: 0,
			lastSiblingId: '',
			displayName: 'a',
			displayValue: '',
			padding: 2,
			width: 3,
			children: [child],
		};

		const expected: Entry = {
			rawName: 'a',
			rawValue: '',
			children: [{
				rawName: 'b',
				rawValue: 'c',
				children: [],
			}],
		};

		expect(BI.boxToEntry(input)).toEqual(expected);
	});
});
