/* eslint-disable no-new */
import { describe, test, expect } from '@jest/globals';

import { Editor } from '../src';

describe('Testing index', () => {
	test('imports should not fail', () => {
		expect(() => { new Editor(); }).toBeCalled();
	});
});
