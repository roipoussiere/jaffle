import { describe, expect, test } from '@jest/globals';

import { GraphExporterError, GraphExporter as GE, PartialBoxTree, BoxTree }
	from '../../src/exporters/graphExporter';
import { FuncTree, FuncType, ValueType } from '../../src/funcTree';

describe('Testing YamlImporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => { throw new GraphExporterError('abc'); }).toThrow(GraphExporterError);
	});
});

describe('Testing GE.getFuncText()', () => {
	const funcTree = {
		name: 'a',
		type: FuncType.Main,
		value: 'b',
		valueType: ValueType.Literal,
		params: [],
	};

	test('simple function returns the func name', () => {
		expect(GE.getFuncText(funcTree)).toBe('a');
	});
});

describe('Testing GE.getvalueText()', () => {
	const funcTree: FuncTree = {
		name: 'a',
		type: FuncType.Main,
		value: 'b',
		valueType: ValueType.Literal,
		params: [],
	};

	test('functions with string value returns the string', () => {
		expect(GE.getvalueText(funcTree)).toBe('b');
		funcTree.value = '.a';
		expect(GE.getvalueText(funcTree)).toBe('.a');
	});

	test('functions with number value returns the stringified number', () => {
		funcTree.value = 42;
		expect(GE.getvalueText(funcTree)).toBe('42');
	});

	test('functions with null value returns the null sign', () => {
		funcTree.value = null;
		expect(GE.getvalueText(funcTree)).toBe('');
	});
});

describe('Testing GE.upgradeTree()', () => {
	const childA: FuncTree = {
		name: 'a',
		type: FuncType.Main,
		value: 1,
		valueType: ValueType.Literal,
		params: [],
	};

	const childB: FuncTree = {
		name: '.b',
		type: FuncType.Chained,
		value: 2,
		valueType: ValueType.Literal,
		params: [],
	};

	const childC: FuncTree = {
		name: 'c',
		type: FuncType.Main,
		value: 3,
		valueType: ValueType.Literal,
		params: [],
	};

	const childE: FuncTree = {
		name: 'e',
		type: FuncType.Main,
		value: 5,
		valueType: ValueType.Literal,
		params: [],
	};

	const childF: FuncTree = {
		name: 'f',
		type: FuncType.Main,
		value: 6,
		valueType: ValueType.Literal,
		params: [],
	};

	const childD: FuncTree = {
		name: '.d',
		type: FuncType.Chained,
		value: 4,
		valueType: ValueType.Tree,
		params: [childE, childF],
	};

	const root: FuncTree = {
		name: 'root',
		type: FuncType.Main,
		value: null,
		valueType: ValueType.Tree,
		params: [childA, childB, childC, childD],
	};

	test('func with several func params are upgraded to partial box tree with correct ids', () => {
		const partialBoxTree = GE.upgradeTree(root);

		expect(partialBoxTree.id).toBe('');
		expect(partialBoxTree.groupId).toBe(0);

		expect(partialBoxTree.children[0].id).toBe('0');
		expect(partialBoxTree.children[0].groupId).toBe(0);

		expect(partialBoxTree.children[1].id).toBe('1');
		expect(partialBoxTree.children[1].groupId).toBe(0);

		expect(partialBoxTree.children[2].id).toBe('2');
		expect(partialBoxTree.children[2].groupId).toBe(1);

		expect(partialBoxTree.children[3].id).toBe('3');
		expect(partialBoxTree.children[3].groupId).toBe(1);

		expect(partialBoxTree.children[3].children[0].id).toBe('3-0');
		expect(partialBoxTree.children[3].children[0].groupId).toBe(0);

		expect(partialBoxTree.children[3].children[1].id).toBe('3-1');
		expect(partialBoxTree.children[3].children[1].groupId).toBe(1);
	});
});

describe('Testing GE.computeBox()', () => {
	const childA: PartialBoxTree = {
		id: '0',
		groupId: 0,
		funcText: 'a',
		funcType: FuncType.Main,
		valueText: 'a',
		valueType: ValueType.Literal,
		isNumber: false,
		children: [],
	};

	const childB: PartialBoxTree = {
		id: '1',
		groupId: 1,
		funcText: 'b',
		funcType: FuncType.Main,
		valueText: 'bbb',
		valueType: ValueType.Literal,
		isNumber: false,
		children: [],
	};

	const childC: PartialBoxTree = {
		id: '2',
		groupId: 1,
		funcText: '.c',
		funcType: FuncType.Chained,
		valueText: 'ccccc',
		valueType: ValueType.Literal,
		isNumber: false,
		children: [],
	};

	const childD: PartialBoxTree = {
		id: '3',
		groupId: 2,
		funcText: 'd',
		funcType: FuncType.Main,
		valueText: 'd',
		valueType: ValueType.Literal,
		isNumber: false,
		children: [],
	};

	const root: PartialBoxTree = {
		id: '',
		groupId: 0,
		funcText: 'root',
		funcType: FuncType.Main,
		valueText: '',
		valueType: ValueType.Tree,
		isNumber: false,
		children: [childA, childB, childC, childD],
	};

	test('simple partial box without root is correctly computed', () => {
		const boxTreeA = GE.computeBox(childA);
		expect(boxTreeA.contentWidth).toBe(3);
		expect(boxTreeA.padding).toBe(2);
		expect(boxTreeA.width).toBe(3);
	});

	test('partial box of a func preceding a chain is correctly computed', () => {
		const boxTreeB = GE.computeBox(childB, root);
		expect(boxTreeB.contentWidth).toBe(5);
		expect(boxTreeB.padding).toBe(3);
		expect(boxTreeB.width).toBe(8);
	});

	test('partial box of chained func is correctly computed', () => {
		const boxTreeC = GE.computeBox(childC, root);
		expect(boxTreeC.contentWidth).toBe(8);
		expect(boxTreeC.padding).toBe(3);
		expect(boxTreeC.width).toBe(8);
	});

	test('partial box of func after a chain is correctly computed', () => {
		const boxTreeD = GE.computeBox(childD, root);
		expect(boxTreeD.contentWidth).toBe(3);
		expect(boxTreeD.padding).toBe(2);
		expect(boxTreeD.width).toBe(3);
	});

	test('partial box of func tree is correctly computed', () => {
		const boxTreeD = GE.computeBox(root);
		expect(boxTreeD.contentWidth).toBe(5);
		expect(boxTreeD.padding).toBe(5);
		expect(boxTreeD.width).toBe(5);
	});
});

describe('Testing GE.export()', () => {
	const input: FuncTree = {
		name: 'a',
		type: FuncType.Main,
		value: 1,
		valueType: ValueType.Literal,
		params: [],
	};

	const expected: BoxTree = {
		id: '',
		groupId: 0,
		funcText: 'a',
		funcType: FuncType.Main,
		valueText: '1',
		valueType: ValueType.Literal,
		isNumber: true,
		contentWidth: 3,
		padding: 2,
		width: 3,
		children: [],
	};

	test('simple box tree is exported to correct box', () => {
		expect(GE.export(input)).toEqual(expected);
	});
});
