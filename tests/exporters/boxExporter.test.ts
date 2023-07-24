import { describe, expect, test } from '@jest/globals';

import * as BE from '../../src/exporters/boxExporter';
import { BoxDisplay, BoxType, BoxTyping, EntryData, ValueType } from '../../src/model';

describe('Testing BE.getBoxType()', () => {
	test('empty string return BoxType.Value', () => {
		expect(BE.getBoxType('')).toBe(BoxType.Value);
	});

	test('string with chained prefix return BoxType.ChainedFunc', () => {
		expect(BE.getBoxType('.a')).toBe(BoxType.ChainedFunc);
	});

	test('string with constant def prefix return BoxType.ChainedFunc', () => {
		expect(BE.getBoxType('$a')).toBe(BoxType.ConstantDef);
	});

	test('string with serialized sufix return BoxType.SerializedData', () => {
		expect(BE.getBoxType('a^')).toBe(BoxType.SerializedData);
	});

	test('other string return BoxType.MainFunc', () => {
		expect(BE.getBoxType('a')).toBe(BoxType.MainFunc);
	});
});

describe('Testing BE.getBoxValue()', () => {
	test('mininotation string return ValueType.Mininotation', () => {
		expect(BE.getValueType('_a')).toBe(ValueType.Mininotation);
	});

	test('expression string return ValueType.Expression', () => {
		expect(BE.getValueType('=a')).toBe(ValueType.Expression);
	});

	test('string of number return ValueType.Number', () => {
		expect(BE.getValueType('42')).toBe(ValueType.Number);
	});

	test('string of boolean return ValueType.Boolean', () => {
		expect(BE.getValueType('true')).toBe(ValueType.Boolean);
		expect(BE.getValueType('false')).toBe(ValueType.Boolean);
	});

	test('empty string return ValueType.Null', () => {
		expect(BE.getValueType('')).toBe(ValueType.Null);
	});

	test('other string return ValueType.String', () => {
		expect(BE.getValueType('a')).toBe(ValueType.String);
	});
});

describe('Testing BE.buildBoxTyping()', () => {
	test('EntryData can be used to build BoxTyping', () => {
		const input: EntryData = {
			rawName: 'a',
			rawValue: '42',
		};
		const expected: BoxTyping = {
			type: BoxType.MainFunc,
			valueType: ValueType.Number,
		};
		expect(BE.buildBoxTyping(input)).toEqual(expected);
	});
});

describe('Testing BE.getDisplayName()', () => {
	test('prefixes are stripped', () => {
		expect(BE.getDisplayName('.a')).toBe('a');
		expect(BE.getDisplayName('$a')).toBe('a');
	});

	test('suffixes are stripped', () => {
		expect(BE.getDisplayName('a^')).toBe('a');
	});

	test('other string remains same', () => {
		expect(BE.getDisplayName('a')).toBe('a');
	});
});

describe('Testing BE.getDisplayValue()', () => {
	test('prefixes are stripped', () => {
		expect(BE.getDisplayValue('_a')).toBe('a');
		expect(BE.getDisplayValue('=a')).toBe('a');
	});

	test('other string remains same', () => {
		expect(BE.getDisplayValue('a')).toBe('a');
	});
});

describe('Testing BE.buildBoxDisplay()', () => {
	test('EntryData can be used to build BoxDisplay', () => {
		const input: EntryData = {
			rawName: '.a',
			rawValue: '_b',
		};
		const expected: BoxDisplay = {
			displayName: 'a',
			displayValue: 'b',
		};
		expect(BE.buildBoxDisplay(input)).toEqual(expected);
	});
});

// describe('Testing GE.boxToPartialGBox()', () => {
// 	const childA: Box = {
// 		name: 'a',
// 		type: BoxType.MainFunc,
// 		value: 1,
// 		valueType: BoxValueType.Number,
// 		children: [],
// 	};

// 	const childB: Box = {
// 		name: '.b',
// 		type: BoxType.ChainedFunc,
// 		value: 2,
// 		valueType: BoxValueType.Number,
// 		children: [],
// 	};

// 	const childC: Box = {
// 		name: 'c',
// 		type: BoxType.MainFunc,
// 		value: 3,
// 		valueType: BoxValueType.Number,
// 		children: [],
// 	};

// 	const childE: Box = {
// 		name: 'e',
// 		type: BoxType.MainFunc,
// 		value: 5,
// 		valueType: BoxValueType.Number,
// 		children: [],
// 	};

// 	const childF: Box = {
// 		name: 'f',
// 		type: BoxType.MainFunc,
// 		value: 6,
// 		valueType: BoxValueType.Number,
// 		children: [],
// 	};

// 	const childD: Box = {
// 		name: '.d',
// 		type: BoxType.ChainedFunc,
// 		value: 4,
// 		valueType: BoxValueType.Empty,
// 		children: [childE, childF],
// 	};

// 	const root: Box = {
// 		name: 'root',
// 		type: BoxType.MainFunc,
// 		value: null,
// 		valueType: BoxValueType.Empty,
// 		children: [childA, childB, childC, childD],
// 	};

// 	test('func with several func params are upgraded to partial box tree with correct ids', () => {
// 		const partialBoxTree = BE.boxToPartialGBox(root);

// 		expect(partialBoxTree.id).toBe('');
// 		expect(partialBoxTree.groupId).toBe(0);

// 		expect(partialBoxTree.children[0].id).toBe('0');
// 		expect(partialBoxTree.children[0].groupId).toBe(0);

// 		expect(partialBoxTree.children[1].id).toBe('1');
// 		expect(partialBoxTree.children[1].groupId).toBe(0);

// 		expect(partialBoxTree.children[2].id).toBe('2');
// 		expect(partialBoxTree.children[2].groupId).toBe(1);

// 		expect(partialBoxTree.children[3].id).toBe('3');
// 		expect(partialBoxTree.children[3].groupId).toBe(1);

// 		expect(partialBoxTree.children[3].children[0].id).toBe('3-0');
// 		expect(partialBoxTree.children[3].children[0].groupId).toBe(0);

// 		expect(partialBoxTree.children[3].children[1].id).toBe('3-1');
// 		expect(partialBoxTree.children[3].children[1].groupId).toBe(1);
// 	});
// });

// describe('Testing GE.partialGBoxToGBox()', () => {
// 	const childA: PartialGraphBox = {
// 		id: '0',
// 		groupId: 0,
// 		name: 'a',
// 		type: BoxType.MainFunc,
// 		valueText: 'a',
// 		valueType: BoxValueType.String,
// 		children: [],
// 	};

// 	const childB: PartialGraphBox = {
// 		id: '1',
// 		groupId: 1,
// 		name: 'b',
// 		type: BoxType.MainFunc,
// 		valueText: 'bbb',
// 		valueType: BoxValueType.String,
// 		children: [],
// 	};

// 	const childC: PartialGraphBox = {
// 		id: '2',
// 		groupId: 1,
// 		name: '.c',
// 		type: BoxType.ChainedFunc,
// 		valueText: 'ccccc',
// 		valueType: BoxValueType.String,
// 		children: [],
// 	};

// 	const childD: PartialGraphBox = {
// 		id: '3',
// 		groupId: 2,
// 		name: 'd',
// 		type: BoxType.MainFunc,
// 		valueText: 'd',
// 		valueType: BoxValueType.String,
// 		children: [],
// 	};

// 	const root: PartialGraphBox = {
// 		id: '',
// 		groupId: 0,
// 		name: 'root',
// 		type: BoxType.MainFunc,
// 		valueText: '',
// 		valueType: BoxValueType.Empty,
// 		children: [childA, childB, childC, childD],
// 	};

// 	test('simple partial box without root is correctly computed', () => {
// 		const boxTreeA = BE.partialGBoxToGBox(childA);
// 		expect(boxTreeA.contentWidth).toBe(3);
// 		expect(boxTreeA.padding).toBe(2);
// 		expect(boxTreeA.width).toBe(3);
// 	});

// 	test('partial box of a func preceding a chain is correctly computed', () => {
// 		const boxTreeB = BE.partialGBoxToGBox(childB, root);
// 		expect(boxTreeB.contentWidth).toBe(5);
// 		expect(boxTreeB.padding).toBe(3);
// 		expect(boxTreeB.width).toBe(8);
// 	});

// 	test('partial box of chained func is correctly computed', () => {
// 		const boxTreeC = BE.partialGBoxToGBox(childC, root);
// 		expect(boxTreeC.contentWidth).toBe(8);
// 		expect(boxTreeC.padding).toBe(3);
// 		expect(boxTreeC.width).toBe(8);
// 	});

// 	test('partial box of func after a chain is correctly computed', () => {
// 		const boxTreeD = BE.partialGBoxToGBox(childD, root);
// 		expect(boxTreeD.contentWidth).toBe(3);
// 		expect(boxTreeD.padding).toBe(2);
// 		expect(boxTreeD.width).toBe(3);
// 	});

// 	test('partial box of func tree is correctly computed', () => {
// 		const boxTreeD = BE.partialGBoxToGBox(root);
// 		expect(boxTreeD.contentWidth).toBe(5);
// 		expect(boxTreeD.padding).toBe(5);
// 		expect(boxTreeD.width).toBe(5);
// 	});
// });

// describe('Testing GE.export()', () => {
// 	const input: Box = {
// 		name: 'a',
// 		type: BoxType.MainFunc,
// 		value: 1,
// 		valueType: BoxValueType.Number,
// 		children: [],
// 	};

// 	const expected: GraphBox = {
// 		id: '',
// 		groupId: 0,
// 		name: 'a',
// 		type: BoxType.MainFunc,
// 		valueText: '1',
// 		valueType: BoxValueType.Number,
// 		contentWidth: 3,
// 		padding: 2,
// 		width: 3,
// 		children: [],
// 	};

// 	test('simple box tree is exported to correct box', () => {
// 		expect(BE.boxToGraphBox(input)).toEqual(expected);
// 	});
// });
