import { describe, expect, test } from '@jest/globals';

import { GraphExporterError, GraphExporter as GI } from '../src/exporters/graphExporter';
import { FuncType, ValueType } from '../src/funcTree';

describe('Testing YamlImporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => { throw new GraphExporterError('abc'); }).toThrow(GraphExporterError);
	});
});

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
