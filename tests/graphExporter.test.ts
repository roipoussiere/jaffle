import { describe, expect, test } from '@jest/globals';

import { GraphExporterError } from '../src/exporters/graphExporter';
import { FuncType, ValueType } from '../src/funcTree';

describe('Testing YamlImporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => { throw new GraphExporterError('abc'); }).toThrow(GraphExporterError);
	});
});

// class Box

const partialBoxTree1 = {
	id: '0',
	groupId: 0,
	funcText: 'b',
	funcType: FuncType.Main,
	valueText: 'c',
	valueType: ValueType.String,
	children: [],
};

const partialBoxTree2 = {
	id: '1',
	groupId: 0,
	funcText: 'd',
	funcType: FuncType.Main,
	valueText: 'e',
	valueType: ValueType.String,
	children: [],
};

const partialBoxTreeRoot = {
	id: '',
	groupId: 0,
	funcText: 'a',
	funcType: FuncType.Main,
	valueText: '',
	valueType: ValueType.Tree,
	children: [partialBoxTree1, partialBoxTree2],
};

// describe('Testing GE.getvalueText()', () => {
// });

// describe('Testing GE.getFuncText()', () => {
// });

// describe('Testing GE.upgradeBox()', () => {
// });

// describe('Testing GE.upgradeTree()', () => {
// });

// describe('Testing GE.export()', () => {
// });
