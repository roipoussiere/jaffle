import { describe, expect, test } from '@jest/globals';

import { GraphExporterError, GraphExporter as GE } from '../src/exporters/graphExporter';
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

// describe('Testing GE.upgradeBox()', () => {
// });

// describe('Testing GE.export()', () => {
// });
