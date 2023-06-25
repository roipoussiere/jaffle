import { describe, expect, test } from '@jest/globals';

import * as e from '../src/errors';
import { testing as t } from '../src/transpiler';

describe('Testing getUniqueAttr()', () => {
	test('Getting unique attr from an object with one attr should return its key', () => {
		expect(t.getUniqueAttr({ foo: 42 })).toBe('foo');
	});

	test('Getting unique attr from a bad object fails', () => {
		expect(() => t.getUniqueAttr({})).toThrow(e.JaffleAttributeError);
		expect(() => t.getUniqueAttr({ foo: 42, bar: 24 })).toThrow(e.JaffleAttributeError);
	});
});

describe('Testing isChainItem()', () => {
	test('Parameters are not chain items', () => {
		expect(t.isChainItem(42)).toBeFalsy();
		expect(t.isChainItem('foo')).toBeFalsy();
		expect(t.isChainItem(null)).toBeFalsy();
		expect(t.isChainItem([1, 2, 3])).toBeFalsy();
		expect(t.isChainItem({ Foo: 42 })).toBeFalsy();
	});

	test('Chain items are chain items', () => {
		expect(t.isChainItem({ foo: 42 })).toBeTruthy();
	});

	test('Bad chain items fails', () => {
		expect(() => t.isChainItem({})).toThrow(e.JaffleAttributeError);
		expect(() => t.isChainItem({ foo: 42, bar: 24 })).toThrow(e.JaffleAttributeError);
	});
});

describe('Testing getParameters()', () => {
	test('Getting parameters from nothing returns any empty array', () => {
		expect(t.getParameters([])).toStrictEqual([]);
	});

	test('Getting parameters from literals returns the literals', () => {
		expect(t.getParameters(['foo'])).toStrictEqual(['foo']);
		expect(t.getParameters([42])).toStrictEqual([42]);
		expect(t.getParameters([null])).toStrictEqual([null]);
		expect(t.getParameters(['foo', 42, null])).toStrictEqual(['foo', 42, null]);
	});

	test('Getting parameters from arrays returns the arrays', () => {
		expect(t.getParameters([[1, 2, 3]])).toStrictEqual([[1, 2, 3]]);
		expect(t.getParameters([[1, 2, 3], [3, 2, 1]])).toStrictEqual([[1, 2, 3], [3, 2, 1]]);
	});

	test('Getting parameters from param objects returns the objects', () => {
		expect(t.getParameters([{ Foo: 42 }])).toStrictEqual([{ Foo: 42 }]);
		expect(t.getParameters([{ Foo: 'bar' }])).toStrictEqual([{ Foo: 'bar' }]);
		expect(t.getParameters([{ Foo: null }])).toStrictEqual([{ Foo: null }]);
		expect(t.getParameters([{ Foo: [1, 2, 3] }])).toStrictEqual([{ Foo: [1, 2, 3] }]);
		expect(t.getParameters([{ Foo: 42 }, { Bar: 24 }])).toStrictEqual([{ Foo: 42 }, { Bar: 24 }]);
	});

	test('Getting parameters from a non-unique param object fails', () => {
		expect(() => t.getParameters([{ Foo: 42, Bar: 24 }])).toThrow(e.JaffleAttributeError);
	});

	test('Getting parameters with chain returns the parameters without the chain', () => {
		expect(t.getParameters([{ bar: 24 }])).toStrictEqual([]);
		expect(t.getParameters([{ Foo: 42 }, { bar: 24 }])).toStrictEqual([{ Foo: 42 }]);
	});

	test('Getting parameters from chain then parameter fails', () => {
		expect(() => t.getParameters([{ bar: 24 }, { Foo: 42 }])).toThrow(e.JaffleAttributeError);
		expect(() => t.getParameters([{ bar: 24 }, 'foo'])).toThrow(e.JaffleAttributeError);
		expect(() => t.getParameters([{ bar: 24 }, 42])).toThrow(e.JaffleAttributeError);
		expect(() => t.getParameters([{ bar: 24 }, null])).toThrow(e.JaffleAttributeError);
		expect(() => t.getParameters([{ bar: 24 }, [1, 2, 3]])).toThrow(e.JaffleAttributeError);
	});
});

describe('Testing transpile()', () => {
	test('Non-valid yaml should fail', () => {
		expect(() => t.transpile(`
- c@3 eb
note:
	`)).toThrow(e.JaffleErrorBadYaml);
	});
});

// test('Empty root should return nothing', () => {
// 	expect(transpiler(`

// `)).toBe('return;');
// });

// test('Number on root should fail', () => {
// 	expect(transpiler(`
// 42
// `)).toThrow(errors.JaffleErrorBadType);
// });

// test('String on root should fail', () => {
// 	expect(transpiler(`
// c@3 eb
// `)).toThrow(errors.JaffleErrorBadType);
// });

// test('Array starting with mini on root should play', () => {
// 	expect(transpiler(`
// - c@3 eb
// - note:
// `)).toBe('mini(`c@3 eb`).note()');
// });

// test('Array not starting with mini on root should fail', () => {
// 	expect(transpiler(`
// - note:
// - c@3 eb
// `)).toThrow(errors.JaffleErrorMainAttr);
// });

// test('Array with several minis on root should fail', () => {
// 	expect(transpiler(`
// - c@3 eb
// - eb@3 c
// `)).toThrow('Main attribute should be unique.');
// });

// test('Main attribute directly on root should play', () => {
// 	expect(transpiler(`
// Note: c@3 eb
// `)).toBe("note(mini('c@3 eb'))");
// });

// test('Several attributes directly on root should fail', () => {
// 	expect(transpiler(`
// Note: c@3 eb
// s: sd*2 oh
// `)).toThrow('Missing main attribute.');
// });
