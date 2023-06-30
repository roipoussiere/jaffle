import { describe, expect, test } from '@jest/globals';

import * as e from '../src/errors';

describe('Testing errors', () => {
	test('Errors should throw when throwed', () => {
		expect(() => { throw new e.JaffleError(''); }).toThrow(e.JaffleError);
		expect(() => { throw new e.NotImplementedJaffleError(''); })
			.toThrow(e.NotImplementedJaffleError);
		expect(() => { throw new e.BadYamlJaffleError(''); }).toThrow(e.BadYamlJaffleError);
		expect(() => { throw new e.BadTypeJaffleError('a', 'b'); }).toThrow(e.BadTypeJaffleError);
		expect(() => { throw new e.BadFunctionJaffleError(''); }).toThrow(e.BadFunctionJaffleError);
		expect(() => { throw new e.BadListJaffleError(''); }).toThrow(e.BadListJaffleError);
		expect(() => { throw new e.BadInitBlockJaffleError(''); })
			.toThrow(e.BadInitBlockJaffleError);
		expect(() => { throw new e.BadDocumentJaffleError(''); }).toThrow(e.BadDocumentJaffleError);
	});
});
