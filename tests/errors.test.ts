import { describe, expect, test } from '@jest/globals';

import * as e from '../src/errors';

describe('Testing errors', () => {
	test('errors should raise when throwed', () => {
		expect(() => { throw new e.JaffleError(''); }).toThrow(e.JaffleError);
		expect(() => { throw new e.NotImplementedError(''); }).toThrow(e.NotImplementedError);
		expect(() => { throw new e.UndefError(''); }).toThrow(e.UndefError);
		expect(() => { throw new e.ImporterError(''); }).toThrow(e.ImporterError);
		expect(() => { throw new e.ExporterError(''); }).toThrow(e.ExporterError);
	});
});
