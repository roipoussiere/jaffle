import { describe, expect, test } from '@jest/globals';

import * as e from '../src/errors';
import { testing as t } from '../src/transpiler';

describe('Testing getJaffleFuncName()', () => {
	test('The name of a function is the function name', () => {
		expect(t.getJaffleFuncName({ foo: 42 })).toBe('foo');
		expect(t.getJaffleFuncName({ Foo: 42 })).toBe('Foo');
	});

	test('Trying to get the function name of a non-function fails', () => {
		expect(() => t.getJaffleFuncName({})).toThrow(e.BadFunctionJaffleError);
		expect(() => t.getJaffleFuncName({ fo: 42, ba: 24 })).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing isJaffleChainedFunc()', () => {
	test('Parameters and main functions are not chained functions', () => {
		expect(t.isJaffleChainedFunc(42)).toBeFalsy();
		expect(t.isJaffleChainedFunc('foo')).toBeFalsy();
		expect(t.isJaffleChainedFunc(null)).toBeFalsy();
		expect(t.isJaffleChainedFunc([1, 2, 3])).toBeFalsy();
		expect(t.isJaffleChainedFunc({ Foo: 42 })).toBeFalsy();
	});

	test('Chained functions are chained functions', () => {
		expect(t.isJaffleChainedFunc({ foo: 42 })).toBeTruthy();
	});

	test('Trying to check if a bad function is chained function fails', () => {
		expect(() => t.isJaffleChainedFunc({})).toThrow(e.BadFunctionJaffleError);
		expect(() => t.isJaffleChainedFunc({ f: 42, b: 24 })).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing getJaffleFuncParams()', () => {
	test('Function parameters of a non-list is a list containing the value', () => {
		expect(t.getJaffleFuncParams('foo')).toEqual(['foo']);
		expect(t.getJaffleFuncParams(42)).toEqual([42]);
		expect(t.getJaffleFuncParams(null)).toEqual([null]);
		expect(t.getJaffleFuncParams({ foo: 42 })).toEqual([{ foo: 42 }]);
	});

	test('Function parameters of empty list is an empty list', () => {
		expect(t.getJaffleFuncParams([])).toEqual([]);
	});

	test('Function parameters of literals are the literals', () => {
		expect(t.getJaffleFuncParams(['foo'])).toStrictEqual(['foo']);
		expect(t.getJaffleFuncParams([42])).toStrictEqual([42]);
		expect(t.getJaffleFuncParams([null])).toStrictEqual([null]);
		expect(t.getJaffleFuncParams(['foo', 42, null])).toStrictEqual(['foo', 42, null]);
	});

	test('Function parameters of arrays are the arrays', () => {
		expect(t.getJaffleFuncParams([[1, 2, 3]])).toStrictEqual([[1, 2, 3]]);
		expect(t.getJaffleFuncParams([[1, 2, 3], [3, 2, 1]])).toStrictEqual([[1, 2, 3], [3, 2, 1]]);
	});

	test('Function parameters of functions are the functions', () => {
		expect(t.getJaffleFuncParams([{ Foo: 42 }])).toStrictEqual([{ Foo: 42 }]);
		expect(t.getJaffleFuncParams([{ Foo: 'bar' }])).toStrictEqual([{ Foo: 'bar' }]);
		expect(t.getJaffleFuncParams([{ Foo: null }])).toStrictEqual([{ Foo: null }]);
		expect(t.getJaffleFuncParams([{ Foo: [1, 2, 3] }])).toStrictEqual([{ Foo: [1, 2, 3] }]);
		expect(t.getJaffleFuncParams([{ F: 42 }, { B: 24 }])).toStrictEqual([{ F: 42 }, { B: 24 }]);
	});

	test('Trying to get function parameters of a bad function fails', () => {
		expect(() => t.getJaffleFuncParams([{ F: 1, B: 2 }])).toThrow(e.BadFunctionJaffleError);
	});

	test('Function parameters with chained function are the parameters without the chain', () => {
		expect(t.getJaffleFuncParams([{ bar: 24 }])).toStrictEqual([]);
		expect(t.getJaffleFuncParams([42, { bar: 24 }])).toStrictEqual([42]);
		expect(t.getJaffleFuncParams([null, { bar: 24 }])).toStrictEqual([null]);
		expect(t.getJaffleFuncParams([[1, 2, 3], { bar: 24 }])).toStrictEqual([[1, 2, 3]]);
		expect(t.getJaffleFuncParams([{ Foo: 42 }, { bar: 24 }])).toStrictEqual([{ Foo: 42 }]);
	});

	test('Trying to get function parameters of parameters defined after the chain fails', () => {
		expect(() => t.getJaffleFuncParams([{ b: 1 }, { F: 2 }])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.getJaffleFuncParams([{ bar: 1 }, 'f'])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.getJaffleFuncParams([{ bar: 24 }, 42])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.getJaffleFuncParams([{ b: 1 }, null])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.getJaffleFuncParams([{ b: 1 }, [2, 3]])).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing checkJaffleFunction()', () => {
	test('Checking a generic function do not fail', () => {
		expect(t.checkJaffleFunction({ foo: 42 }));
	});

	test('Trying to check a non-function fails', () => {
		expect(() => t.checkJaffleFunction(42)).toThrow(e.BadFunctionJaffleError);
		expect(() => t.checkJaffleFunction('foo')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.checkJaffleFunction(null)).toThrow(e.BadFunctionJaffleError);
		expect(() => t.checkJaffleFunction([1, 2, 3])).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing checkJaffleList()', () => {
	test('Checking a list do not fail', () => {
		expect(t.checkJaffleList([1, 2, 3]));
	});

	test('Trying to check a non-list fails', () => {
		expect(() => t.checkJaffleList(42)).toThrow(e.BadListJaffleError);
		expect(() => t.checkJaffleList('foo')).toThrow(e.BadListJaffleError);
		expect(() => t.checkJaffleList(null)).toThrow(e.BadListJaffleError);
		expect(() => t.checkJaffleList({ foo: 42 })).toThrow(e.BadListJaffleError);
	});
});

// describe('Testing stringToJs()', () => {
// });

describe('Testing jaffleAnyToJs()', () => {
	test('Literals should be transpiled into literals', () => {
		expect(t.jaffleAnyToJs(null)).toBe('null');
		expect(t.jaffleAnyToJs(42)).toBe('42');
		expect(t.jaffleAnyToJs('bar')).toBe('`bar`');
	});

	test('Lists should be transpiled into lists', () => {
		expect(t.jaffleAnyToJs([])).toBe('');
		expect(t.jaffleAnyToJs([1, 2, 3])).toBe('1, 2, 3');
		expect(t.jaffleAnyToJs([42, null, 'foo'])).toBe('42, null, `foo`');
	});

	test('Main functions should be transpiled into function calls', () => {
		expect(t.jaffleAnyToJs({ Foo: 42 })).toBe('foo(42)');
		expect(t.jaffleAnyToJs({ Foo: [1, 2, 3] })).toBe('foo(1, 2, 3)');
		expect(t.jaffleAnyToJs({ Foo: null })).toBe('foo()');
		expect(t.jaffleAnyToJs({ Foo_: null })).toBe('foo');
	});

	test.skip('Chained functions should be transpiled into chained function calls', () => {
		expect(t.jaffleAnyToJs({ foo: 42 })).toBe('.foo(42)');
		expect(t.jaffleAnyToJs({ foo: [1, 2, 3] })).toBe('.foo(1, 2, 3)');
		expect(t.jaffleAnyToJs({ foo: null })).toBe('.foo()');
	});

	test.skip('Trying to transpile bad functions fails', () => {
		expect(() => t.jaffleAnyToJs({ foo_: null })).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleAnyToJs({})).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleAnyToJs({ foo: 42 })).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleAnyToJs([{ f: 42 }, { B: 24 }])).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing jaffleFunctionToJs()', () => {
	test('Trying to transpile an empty function fails', () => {
		expect(() => t.jaffleFunctionToJs({})).toThrowError(e.BadFunctionJaffleError);
	});

	test('Main functions are transpiled into main function call', () => {
		expect(t.jaffleFunctionToJs({ Foo: 42 })).toBe('foo(42)');
		expect(t.jaffleFunctionToJs({ Foo: 'bar' })).toBe('foo(`bar`)');
		expect(t.jaffleFunctionToJs({ Foo: null })).toBe('foo()');
		expect(t.jaffleFunctionToJs({ Foo_: null })).toBe('foo');
		expect(t.jaffleFunctionToJs({ Foo: [1, 2, 3] })).toBe('foo(1, 2, 3)');
		expect(t.jaffleFunctionToJs({ Foo: { Bar: 42 } })).toBe('foo(bar(42))');
		expect(t.jaffleFunctionToJs({ Fo: [{ Ba: [1, 2] }, 3, 'b'] })).toBe('fo(ba(1, 2), 3, `b`)');
	});

	test.skip('chained functions are transpiled into a chained function call', () => {
		expect(t.jaffleFunctionToJs({ foo: 42 })).toBe('.foo(42)');
	});
});

describe('Testing jaffleInitListToJs()', () => {
	test('Empty init block is transpiled into an empty string', () => {
		expect(t.jaffleInitListToJs([])).toBe('');
		expect(t.jaffleInitListToJs([{}])).toBe('');
		expect(t.jaffleInitListToJs([{}, {}])).toBe('');
	});

	test('Functions in init block are transpiled into code calling the functions', () => {
		expect(t.jaffleInitListToJs([{ Foo: 42 }])).toBe('foo(42);\n');
		expect(t.jaffleInitListToJs([{ Foo: 'bar' }])).toBe('foo(`bar`);\n');
		expect(t.jaffleInitListToJs([{ Foo: null }])).toBe('foo();\n');
		expect(t.jaffleInitListToJs([{ Foo: ['bar', 42] }])).toBe('foo(`bar`, 42);\n');
		expect(t.jaffleInitListToJs([{ Foo: { Bar: 42 } }])).toBe('foo(bar(42));\n');
	});

	test('Several functions in init block is transpiled into code calling those functions', () => {
		expect(t.jaffleInitListToJs([{ Foo: 42 }, { Bar: 24 }])).toBe('foo(42);\nbar(24);\n');
	});

	test.skip('Chained functions in init block are transpiled into code calling the chain', () => {
		expect(t.jaffleInitListToJs([{ Fo: [{ Ba: 42 }, { ba: 24 }] }])).toBe('fo(ba(42)).ba(24);');
		expect(t.jaffleInitListToJs([{ foo: 42 }])).toBe('');
	});

	test.skip('Trying to transpile non-valid init block fails', () => {
		expect(() => t.jaffleInitListToJs([{ fo: 1, ba: 2 }])).toThrow(e.BadInitBlockJaffleError);
		expect(() => t.jaffleInitListToJs([{ f: 1 }, { B: 2 }])).toThrow(e.BadInitBlockJaffleError);
	});
});

describe('Testing jaffleDocumentToJs()', () => {
	test('Trying to transpile non-valid yaml fails', () => {
		expect(() => t.jaffleDocumentToJs(`
- c@3 eb
note:
		`)).toThrow(e.BadYamlJaffleError);
	});

	test('Trying to transpile a yaml document without an object on root fails', () => {
		expect(() => t.jaffleDocumentToJs('foo')).toThrow(e.BadDocumentJaffleError);
		expect(() => t.jaffleDocumentToJs('42')).toThrow(e.BadDocumentJaffleError);
		expect(() => t.jaffleDocumentToJs('null')).toThrow(e.BadDocumentJaffleError);
		expect(() => t.jaffleDocumentToJs('[1, 2, 3]')).toThrow(e.BadDocumentJaffleError);
	});

	test.skip('Trying to transpile a yaml document without valid functions fails', () => {
		expect(() => t.jaffleDocumentToJs('{foo: 42}')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleDocumentToJs('{fo: 1, ba: 2}')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleDocumentToJs('{Fo: 1, ba: 2}')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleDocumentToJs('{fo: 1, Ba: 2}')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleDocumentToJs('{Fo: 1, Ba: 2}')).toThrow(e.BadFunctionJaffleError);
	});

	test.skip('Yaml document with valid functions are transpiled into valid code', () => {
		expect(t.jaffleDocumentToJs('{Foo: 42}')).toBe('return foo(42);');
		expect(t.jaffleDocumentToJs('{Foo: bar}')).toBe('return foo(`bar`);');
		expect(t.jaffleDocumentToJs('{Foo: }')).toBe('return foo();');
	});

	test.skip('Yaml document with init block are transpiled into valid code', () => {
		expect(t.jaffleDocumentToJs('{Init: [], Foo: 42}')).toBe('return foo(42);');
	});
});

// test('Empty root should return nothing', () => {
// 	expect(jaffleDocumentToJsr(`

// `)).toBe('return;');
// });

// test('Number on root should fail', () => {
// 	expect(jaffleDocumentToJsr(`
// 42
// `)).toThrow(errors.JaffleErrorBadType);
// });

// test('String on root should fail', () => {
// 	expect(jaffleDocumentToJsr(`
// c@3 eb
// `)).toThrow(errors.JaffleErrorBadType);
// });

// test('Array starting with mini on root should play', () => {
// 	expect(jaffleDocumentToJsr(`
// - c@3 eb
// - note:
// `)).toBe('mini(`c@3 eb`).note()');
// });

// test('Array not starting with mini on root should fail', () => {
// 	expect(jaffleDocumentToJsr(`
// - note:
// - c@3 eb
// `)).toThrow(errors.JaffleErrorMainAttr);
// });

// test('Array with several minis on root should fail', () => {
// 	expect(jaffleDocumentToJsr(`
// - c@3 eb
// - eb@3 c
// `)).toThrow('Main attribute should be unique.');
// });

// test('Main attribute directly on root should play', () => {
// 	expect(jaffleDocumentToJsr(`
// Note: c@3 eb
// `)).toBe("note(mini('c@3 eb'))");
// });

// test('Several attributes directly on root should fail', () => {
// 	expect(jaffleDocumentToJsr(`
// Note: c@3 eb
// s: sd*2 oh
// `)).toThrow('Missing main attribute.');
// });
