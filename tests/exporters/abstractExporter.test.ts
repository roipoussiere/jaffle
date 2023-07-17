import { describe, expect, test } from '@jest/globals';

import AbstractExporter from '../../src/exporters/abstractExporter';
import { AbstractClassError } from '../../src/errors';
import { FuncType, ValueType } from '../../src/funcTree';

describe('Testing AbstractExporter constructor', () => {
	test('instanciating abstract class fails', () => {
		// eslint-disable-next-line no-new
		expect(() => { new AbstractExporter(); }).toThrow(AbstractClassError);
	});
});

describe('Testing AE.export()', () => {
	test('calling abstract method fails', () => {
		class Exporter extends AbstractExporter {}
		const funcTree = {
			name: 'a',
			type: FuncType.Main,
			value: null,
			valueType: ValueType.Null,
			params: [],
		};

		expect(() => Exporter.export(funcTree)).toThrow(AbstractClassError);
	});
});
