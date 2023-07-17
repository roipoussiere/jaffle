import { describe, expect, test } from '@jest/globals';

import AbstractImporter from '../../src/importers/abstractImporter';
import { AbstractClassError } from '../../src/errors';

describe('Testing AbstractImporter constructor', () => {
	test('instanciating abstract class fails', () => {
		// eslint-disable-next-line no-new
		expect(() => { new AbstractImporter(); }).toThrow(AbstractClassError);
	});
});

describe('Testing AE.export()', () => {
	test('calling abstract method fails', () => {
		class Importer extends AbstractImporter {}
		expect(() => Importer.import('')).toThrow(AbstractClassError);
	});
});
