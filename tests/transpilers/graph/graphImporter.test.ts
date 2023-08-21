import { describe, expect, test } from '@jest/globals';

import * as GI from '../../../src/transpilers/graph/graphImporter';
import { EntryType, Entry, ValueType } from '../../../src/model';
import { Box } from '../../../src/transpilers/graph/graphModel';

describe('Testing GI.boxToEntry()', () => {
	test('box without children can be converted to an Entry', () => {
		const input: Box = {
			rawName: 'a',
			rawValue: 'b',
			type: EntryType.Function,
			valueType: ValueType.String,
			isSerialized: false,
			error: false,
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

		expect(GI.boxToEntry(input)).toEqual(expected);
	});

	test('box with children can be converted to an Entry', () => {
		const child: Box = {
			rawName: 'b',
			rawValue: 'c',
			type: EntryType.Function,
			valueType: ValueType.String,
			isSerialized: false,
			error: false,
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
			type: EntryType.Function,
			valueType: ValueType.String,
			isSerialized: false,
			error: false,
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

		expect(GI.boxToEntry(input)).toEqual(expected);
	});
});
