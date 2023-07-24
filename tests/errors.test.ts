import { describe, expect, test } from '@jest/globals';

import * as e from '../src/errors';

describe('Testing errors', () => {
	test('Errors should throw when throwed', () => {
		expect(() => { throw new e.JaffleError(''); }).toThrow(e.JaffleError);
		expect(() => { throw new e.NotImplementedError(''); }).toThrow(e.NotImplementedError);
		expect(() => { throw new e.ImporterError(''); }).toThrow(e.ImporterError);
		expect(() => { throw new e.ExporterError(''); }).toThrow(e.ExporterError);

		expect(() => { throw new e.BadYamlJaffleError(''); }).toThrow(e.BadYamlJaffleError);
		expect(() => { throw new e.BadStringJaffleError(''); }).toThrow(e.BadStringJaffleError);
		expect(() => { throw new e.BadFunctionJaffleError(''); }).toThrow(e.BadFunctionJaffleError);
		expect(() => { throw new e.BadListJaffleError(''); }).toThrow(e.BadListJaffleError);
		expect(() => { throw new e.BadDocumentJaffleError(''); }).toThrow(e.BadDocumentJaffleError);
	});
});
