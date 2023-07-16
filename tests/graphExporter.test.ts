import { describe, expect, test } from '@jest/globals';

import { GraphExporterError } from '../src/exporters/graphExporter';

describe('Testing YamlImporterError', () => {
	test('YamlImporterError should raise', () => {
		expect(() => { throw new GraphExporterError('abc'); }).toThrow(GraphExporterError);
	});
});

// class Box

// describe('Testing B.getWidth()', () => {
// });

// describe('Testing B.getPadding()', () => {
// });

// describe('Testing B.getContentWidth()', () => {
// });

// describe('Testing B.getGroup()', () => {
// });

// describe('Testing Box()', () => {
// });

// class GraphExporter

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
