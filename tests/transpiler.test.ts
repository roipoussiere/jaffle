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
		expect(() => t.getJaffleFuncName({ foo: 42, bar: 24 })).toThrow(e.BadFunctionJaffleError);
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
		expect(() => t.isJaffleChainedFunc({ foo: 42, bar: 24 })).toThrow(e.BadFunctionJaffleError);
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
		expect(() => t.getJaffleFuncParams([{ Foo: 1, Bar: 2 }])).toThrow(e.BadFunctionJaffleError);
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
		expect(() => t.getJaffleFuncParams([{ foo: 1 }, 'bar'])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.getJaffleFuncParams([{ foo: 42 }, 24])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.getJaffleFuncParams([{ foo: 1 }, null])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.getJaffleFuncParams([{ foo: 1 }, [2, 3]])).toThrow(e.BadFunctionJaffleError);
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

describe('Testing jaffleStringToJs()', () => {
	test('Simple strings are transpiled to the string', () => {
		expect(t.jaffleStringToJs('foo')).toBe("'foo'");
		expect(t.jaffleStringToJs(' foo bar baz ')).toBe("'foo bar baz'");
		expect(t.jaffleStringToJs('\nfoo\nbar\nbaz\n')).toBe('`foo\nbar\nbaz`');
	});

	test('Strings with optional prefix are transpiled into the string without the prefix', () => {
		expect(t.jaffleStringToJs('/foo')).toBe("'foo'");
		expect(t.jaffleStringToJs('/foo bar\nbaz')).toBe('`foo bar\nbaz`');
		expect(t.jaffleStringToJs('/=foo')).toBe("'=foo'");
		expect(t.jaffleStringToJs('/.foo')).toBe("'.foo'");
	});

	test('Expression strings are transpiled into expressions', () => {
		expect(t.jaffleStringToJs('=2+3')).toBe('2+3');
		expect(t.jaffleStringToJs('=2-3')).toBe('2-3');
		expect(t.jaffleStringToJs('=2*3')).toBe('2*3');
		expect(t.jaffleStringToJs('=2/3')).toBe('2/3');
		expect(t.jaffleStringToJs('=2**3')).toBe('2**3');
		expect(t.jaffleStringToJs('=2 + 3 - 4 * 5')).toBe('2 + 3 - 4 * 5');

		expect(t.jaffleStringToJs('=(42)')).toBe('(42)');
		expect(t.jaffleStringToJs('=(1+2) - (3*4) / (5**6)')).toBe('(1+2) - (3*4) / (5**6)');

		expect(t.jaffleStringToJs('=0.42')).toBe('0.42');
		expect(t.jaffleStringToJs('=.42')).toBe('.42');

		expect(t.jaffleStringToJs('=a')).toBe('a');
		expect(t.jaffleStringToJs('=ab')).toBe('');
		expect(t.jaffleStringToJs('=ab + cd')).toBe(' + ');
		expect(t.jaffleStringToJs('=a b')).toBe('a b');
		expect(t.jaffleStringToJs('=(a+1) - (b*2) / (c**3)')).toBe('(a+1) - (b*2) / (c**3)');
	});

	test('Mini-notation strings are transpiled into a call to mini', () => {
		expect(t.jaffleStringToJs('_foo')).toBe("mini('foo')");
		expect(t.jaffleStringToJs('_foo bar\nbaz')).toBe('mini(`foo bar\nbaz`)');
	});
});

describe('Testing jaffleAnyToJs()', () => {
	test('Literals transpile into literals', () => {
		expect(t.jaffleAnyToJs(null)).toBe('null');
		expect(t.jaffleAnyToJs(42)).toBe('42');
		expect(t.jaffleAnyToJs('bar')).toBe("'bar'");
	});

	test('Lists transpile into lists', () => {
		expect(t.jaffleAnyToJs([])).toBe('');
		expect(t.jaffleAnyToJs([1, 2, 3])).toBe('1, 2, 3');
		expect(t.jaffleAnyToJs([42, null, 'foo'])).toBe("42, null, 'foo'");
	});

	test('Main functions transpile into function calls', () => {
		expect(t.jaffleAnyToJs({ Foo: 42 })).toBe('foo(42)');
		expect(t.jaffleAnyToJs({ Foo: [1, 2, 3] })).toBe('foo(1, 2, 3)');
		expect(t.jaffleAnyToJs({ Foo: null })).toBe('foo()');
		expect(t.jaffleAnyToJs({ 'Foo.': null })).toBe('foo');
	});

	test('Functions list transpile into list of function calls', () => {
		expect(t.jaffleAnyToJs([{ Foo: 42 }, { bar: 'baz' }])).toBe("foo(42), bar('baz')");
	});

	test('Trying to transpile bad functions fails', () => {
		expect(() => t.jaffleAnyToJs({})).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing serialize()', () => {
	test('objects are correctly serialized', () => {
		expect(t.serialize(42)).toBe('42');
		expect(t.serialize(null)).toBe('null');
		expect(t.serialize('bar')).toBe("'bar'");
		expect(t.serialize([1, 2, 3])).toBe('[1,2,3]');
		expect(t.serialize({ foo: 42 })).toBe("{'foo':42}");
		expect(t.serialize({ foo: 'bar' })).toBe("{'foo':'bar'}");
		expect(t.serialize({ foo: [1, 2, 3] })).toBe("{'foo':[1,2,3]}");
		expect(t.serialize({ foo: { bar: 42 } })).toBe("{'foo':{'bar':42}}");
	});
});

describe('Testing jaffleFunctionToJs()', () => {
	test('trying to transpile an empty function fails', () => {
		expect(() => t.jaffleFunctionToJs({})).toThrowError(e.BadFunctionJaffleError);
	});

	test('main functions are transpiled into main function call', () => {
		expect(t.jaffleFunctionToJs({ Foo: 42 })).toBe('foo(42)');
		expect(t.jaffleFunctionToJs({ Foo: 'bar' })).toBe("foo('bar')");
		expect(t.jaffleFunctionToJs({ Foo: null })).toBe('foo()');
		expect(t.jaffleFunctionToJs({ 'Foo.': null })).toBe('foo');
		expect(t.jaffleFunctionToJs({ Foo: [1, 2, 3] })).toBe('foo(1, 2, 3)');
		expect(t.jaffleFunctionToJs({ Foo: { Bar: 42 } })).toBe('foo(bar(42))');
		expect(t.jaffleFunctionToJs({ Fo: [{ Ba: [1, 2] }, 3, 'b'] })).toBe("fo(ba(1, 2), 3, 'b')");
	});

	test('function named M are transpiled into a call to mini()', () => {
		expect(t.jaffleFunctionToJs({ M: 'foo' })).toBe("mini('foo')");
	});

	test('chained functions are transpiled into a function call', () => {
		expect(t.jaffleFunctionToJs({ foo: 42 })).toBe('foo(42)');
	});

	test('serialized functions are transpiled into a function call with serialized param', () => {
		expect(t.jaffleFunctionToJs({ 'foo^': 'bar' })).toBe("foo('bar')");
		expect(t.jaffleFunctionToJs({ 'fo^': { Ba: { be: 42 } } })).toBe("fo({'Ba':{'be':42}})");
		expect(t.jaffleFunctionToJs({ 'fo^1': [{ Ba: { be: 42 } }, { Bi: 42 }, { bo: 24 }] }))
			.toBe("fo({'Ba':{'be':42}}, bi(42)).bo(24)");
	});

	test('Lambda functions are transpiled into lambda function calls', () => {
		expect(t.jaffleFunctionToJs({ Set: [{ foo: 42 }] })).toBe('x => x.foo(42)');
		expect(t.jaffleFunctionToJs({ Set: ['n', { foo: '=n-1' }] })).toBe('(x, n) => x.foo(n-1)');
		expect(t.jaffleFunctionToJs({ Set: ['nm', { foo: '=n' }, { bar: '=m' }] }))
			.toBe('(x, n, m) => x.foo(n).bar(m)');
	});
});

describe('Testing jaffleInitBlockToJs()', () => {
	test('Empty init block is transpiled into an empty string', () => {
		expect(t.jaffleInitBlockToJs([])).toBe('');
	});

	test('Functions in init block are transpiled into code calling the functions', () => {
		expect(t.jaffleInitBlockToJs([{ Foo: 42 }])).toBe('foo(42);\n');
		expect(t.jaffleInitBlockToJs([{ Foo: 'bar' }])).toBe("foo('bar');\n");
		expect(t.jaffleInitBlockToJs([{ Foo: null }])).toBe('foo();\n');
		expect(t.jaffleInitBlockToJs([{ Foo: ['bar', 42] }])).toBe("foo('bar', 42);\n");
		expect(t.jaffleInitBlockToJs([{ Foo: { Bar: 42 } }])).toBe('foo(bar(42));\n');
	});

	test('Several functions in init block is transpiled into code calling those functions', () => {
		expect(t.jaffleInitBlockToJs([{ Foo: 42 }, { Bar: 24 }])).toBe('foo(42);\nbar(24);\n');
	});

	test('Chained functions in init block are transpiled into code calling the chain', () => {
		expect(t.jaffleInitBlockToJs([{ Fo: [{ Ba: 1 }, { be: 2 }] }])).toBe('fo(ba(1)).be(2);\n');
	});

	test('Trying to transpile non-valid init block fails', () => {
		expect(() => t.jaffleInitBlockToJs([{}])).toThrow(e.BadInitBlockJaffleError);
		expect(() => t.jaffleInitBlockToJs([{ foo: 42 }])).toThrow(e.BadInitBlockJaffleError);
		expect(() => t.jaffleInitBlockToJs([{ fo: 1, ba: 2 }])).toThrow(e.BadInitBlockJaffleError);
		expect(() => t.jaffleInitBlockToJs([{ f: 1 }, { B: 2 }]))
			.toThrow(e.BadInitBlockJaffleError);
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

	test('Trying to transpile a yaml document without valid functions fails', () => {
		expect(() => t.jaffleDocumentToJs('{foo: 42}')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleDocumentToJs('{foo: 42, bar: 24}')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleDocumentToJs('{Foo: 42, bar: 24}')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleDocumentToJs('{foo: 42, Bar: 24}')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleDocumentToJs('{Foo: 42, Bar: 24}')).toThrow(e.BadFunctionJaffleError);
	});

	test('Yaml document with valid functions are transpiled into valid code', () => {
		expect(t.jaffleDocumentToJs('{Foo: 42}')).toBe('return foo(42);');
		expect(t.jaffleDocumentToJs('{Foo: bar}')).toBe("return foo('bar');");
		expect(t.jaffleDocumentToJs('{Foo: }')).toBe('return foo();');
	});

	test('Yaml document with init block are transpiled into valid code', () => {
		expect(t.jaffleDocumentToJs('{Init: [], Foo: 42}')).toBe('return foo(42);');
	});
});

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
