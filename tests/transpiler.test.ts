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
	test('Getting parameters of a non-array returns an array containing the value', () => {
		expect(t.getParameters('foo')).toEqual(['foo']);
		expect(t.getParameters(42)).toEqual([42]);
		expect(t.getParameters(null)).toEqual([null]);
		expect(t.getParameters({ foo: 42 })).toEqual([{ foo: 42 }]);
	});

	test('Getting parameters of empty array returns any empty array', () => {
		expect(t.getParameters([])).toEqual([]);
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

describe('Testing checkDict()', () => {
	test('Dict should pass', () => {
		expect(t.checkDict({ foo: 42 }));
	});

	test('Non-dict should fail', () => {
		expect(() => t.checkDict(42)).toThrow(e.JaffleErrorBadType);
		expect(() => t.checkDict('foo')).toThrow(e.JaffleErrorBadType);
		expect(() => t.checkDict(null)).toThrow(e.JaffleErrorBadType);
		expect(() => t.checkDict([1, 2, 3])).toThrow(e.JaffleErrorBadType);
	});
});

describe('Testing checkArray()', () => {
	test('Array should pass', () => {
		expect(t.checkArray([1, 2, 3]));
	});

	test('Non-array should fail', () => {
		expect(() => t.checkArray(42)).toThrow(e.JaffleErrorBadType);
		expect(() => t.checkArray('foo')).toThrow(e.JaffleErrorBadType);
		expect(() => t.checkArray(null)).toThrow(e.JaffleErrorBadType);
		expect(() => t.checkArray({ foo: 42 })).toThrow(e.JaffleErrorBadType);
	});
});

// describe('Testing stringToJs()', () => {
// });

// describe('Testing anyToJs()', () => {
// });

// describe('Testing dictToJs()', () => {
// });

describe('Testing initListToJs()', () => {
	test('Empty arrays or dicts should return an empty string', () => {
		expect(t.initListToJs([])).toBe('');
		expect(t.initListToJs([{}])).toBe('');
		expect(t.initListToJs([{}, {}])).toBe('');
	});

	test('Array containing a function should return code calling the function', () => {
		expect(t.initListToJs([{ Foo: 42 }])).toBe('foo(42);\n');
		expect(t.initListToJs([{ Foo: 'bar' }])).toBe('foo(`bar`);\n');
		expect(t.initListToJs([{ Foo: null }])).toBe('foo();\n');
		expect(t.initListToJs([{ Foo: ['bar', 42] }])).toBe('foo(`bar`, 42);\n');
		expect(t.initListToJs([{ Foo: { Bar: 42 } }])).toBe('foo(bar(42));\n');
	});

	test('Array containing several functions should return code calling those functions', () => {
		expect(t.initListToJs([{ Foo: 42 }, { Bar: 24 }])).toBe('foo(42);\nbar(24);\n');
	});

	test.skip('Array containing a chain should return code calling the chain', () => {
		expect(t.initListToJs([{ Foo: [{ Bar: 42 }, { baz: 24 }] }])).toBe('foo(bar(42)).baz(24);');
		expect(t.initListToJs([{ foo: 42 }])).toBe('');
	});

	test.skip('Array containing non-valid functions should fail', () => {
		expect(() => t.initListToJs([{ foo: 42, bar: 24 }])).toThrow(e.JaffleAttributeError);
		expect(() => t.initListToJs([{ foo: 42 }, { Bar: 24 }])).toThrow(e.JaffleAttributeError);
	});
});

describe('Testing transpile()', () => {
	test('Non-valid yaml should fail', () => {
		expect(() => t.transpile(`
- c@3 eb
note:
		`)).toThrow(e.JaffleErrorBadYaml);
	});

	test('Yaml root not being an object should fail', () => {
		expect(() => t.transpile('foo')).toThrow(e.JaffleErrorBadType);
		expect(() => t.transpile('42')).toThrow(e.JaffleErrorBadType);
		expect(() => t.transpile('null')).toThrow(e.JaffleErrorBadType);
		expect(() => t.transpile('[1, 2, 3]')).toThrow(e.JaffleErrorBadType);
	});

	test.skip('Yaml root without valid parameter should fail', () => {
		expect(() => t.transpile('{foo: 42}')).toThrow(e.JaffleAttributeError);
		expect(() => t.transpile('{foo: 42, bar: 24}')).toThrow(e.JaffleAttributeError);
		expect(() => t.transpile('{Foo: 42, bar: 24}')).toThrow(e.JaffleAttributeError);
		expect(() => t.transpile('{foo: 42, Bar: 24}')).toThrow(e.JaffleAttributeError);
		expect(() => t.transpile('{Foo: 42, Bar: 24}')).toThrow(e.JaffleAttributeError);
	});

	test.skip('Yaml root parameter with literal value should return code', () => {
		expect(t.transpile('{Foo: 42}')).toBe('return foo(42);');
		expect(t.transpile('{Foo: bar}')).toBe('return foo(`bar`);');
		expect(t.transpile('{Foo: }')).toBe('return foo();');
	});

	test.skip('Yaml root with Init should return code with init functions', () => {
		expect(t.transpile('{Init: [], Foo: 42}')).toBe('return foo(42);');
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
