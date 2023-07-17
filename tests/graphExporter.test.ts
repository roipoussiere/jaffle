import { describe, expect, test } from '@jest/globals';

import { GraphExporterError, GraphExporter as GE, PartialBoxTree } from '../src/exporters/graphExporter';
import { FuncTree, FuncType, ValueType } from '../src/funcTree';

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
		valueType: ValueType.String,
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
		valueType: ValueType.String,
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
		expect(GE.getvalueText(funcTree)).toBe('∅');
	});
});

describe('Testing GE.upgradeTree()', () => {
	const childA: FuncTree = {
		name: 'a',
		type: FuncType.Main,
		value: 1,
		valueType: ValueType.Number,
		params: [],
	};

	const childB: FuncTree = {
		name: '.b',
		type: FuncType.Chained,
		value: 2,
		valueType: ValueType.Number,
		params: [],
	};

	const childC: FuncTree = {
		name: 'c',
		type: FuncType.Main,
		value: 3,
		valueType: ValueType.Number,
		params: [],
	};

	const childE: FuncTree = {
		name: 'e',
		type: FuncType.Main,
		value: 5,
		valueType: ValueType.Number,
		params: [],
	};

	const childF: FuncTree = {
		name: 'f',
		type: FuncType.Main,
		value: 6,
		valueType: ValueType.Number,
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
		value: '',
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

// describe('Testing GE.upgradeBox()', () => {
// });

// describe('Testing GE.export()', () => {
// });
