import { describe, expect, test } from '@jest/globals';

import * as e from '../src/errors';
import { testing as t } from '../src/transpiler';

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

describe('Testing getJaffleFuncName()', () => {
	test('The name of a function is the function name', () => {
		expect(t.getJaffleFuncName({ foo: 42 })).toBe('foo');
		expect(t.getJaffleFuncName({ Foo: 42 })).toBe('Foo');
		expect(t.getJaffleFuncName({ '.foo': 42 })).toBe('.foo');
	});

	test('Trying to get the function name of a non-function fails', () => {
		expect(() => t.getJaffleFuncName({})).toThrow(e.BadFunctionJaffleError);
		expect(() => t.getJaffleFuncName({ foo: 42, bar: 24 })).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing isJaffleFunction()', () => {
	test('An object is a jaffle function', () => {
		expect(t.isJaffleFunction({ foo: 42 })).toBeTruthy();
		expect(t.isJaffleFunction({ Foo: 42 })).toBeTruthy();
		expect(t.isJaffleFunction({ '.foo': 42 })).toBeTruthy();
	});

	test('Literals and arrays are not jaffle functions', () => {
		expect(t.isJaffleFunction(42)).toBeFalsy();
		expect(t.isJaffleFunction('foo')).toBeFalsy();
		expect(t.isJaffleFunction(null)).toBeFalsy();
		expect(t.isJaffleFunction([1, 2, 3])).toBeFalsy();
	});
});

describe('Testing toJaffleFunction()', () => {
	test('Converting an object to a jaffle function does not fail', () => {
		expect(t.toJaffleFunction({ foo: 42 }));
	});

	test('Converting a non-object to a jaffle function fails', () => {
		expect(() => t.toJaffleFunction(42)).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing isJaffleList()', () => {
	test('An array is a jaffle list', () => {
		expect(t.isJaffleList([1, 2, 3])).toBeTruthy();
	});

	test('Non-arrays are not jaffle lists', () => {
		expect(t.isJaffleList(42)).toBeFalsy();
		expect(t.isJaffleList('foo')).toBeFalsy();
		expect(t.isJaffleList(null)).toBeFalsy();
		expect(t.isJaffleList({ foo: 42 })).toBeFalsy();
	});
});

describe('Testing toJaffleList()', () => {
	test('Converting an array to a jaffle list does not fail', () => {
		expect(t.toJaffleList([1, 2, 3]));
	});

	test('Converting an array to a jaffle list fails', () => {
		expect(() => t.toJaffleList(42)).toThrow(e.BadListJaffleError);
	});
});

// describe('Testing extractJaffleInitBlock()', () => {...});

// describe('Testing getJaffleFuncParams()', () => {...});

describe('Testing groupJaffleFuncParams()', () => {
	test('lists of one item are grouped into one group of one item', () => {
		expect(t.groupJaffleFuncParams([null])).toEqual([[null]]);
		expect(t.groupJaffleFuncParams([42])).toEqual([[42]]);
		expect(t.groupJaffleFuncParams(['foo'])).toEqual([['foo']]);
		expect(t.groupJaffleFuncParams([[1, 2, 3]])).toEqual([[[1, 2, 3]]]);
		expect(t.groupJaffleFuncParams([{ foo: 42 }])).toEqual([[{ foo: 42 }]]);
	});

	test('lists of several items are grouped into groups of one item', () => {
		expect(t.groupJaffleFuncParams([null, null])).toEqual([[null], [null]]);
		expect(t.groupJaffleFuncParams([1, 2])).toEqual([[1], [2]]);
		expect(t.groupJaffleFuncParams(['a', 'b'])).toEqual([['a'], ['b']]);
		expect(t.groupJaffleFuncParams([[1, 2], [3, 4]])).toEqual([[[1, 2]], [[3, 4]]]);
		expect(t.groupJaffleFuncParams([{ a: 1 }, { b: 2 }])).toEqual([[{ a: 1 }], [{ b: 2 }]]);
	});

	test('lists of main/chain functions mix are grouped into groups of main functions', () => {
		expect(t.groupJaffleFuncParams([{ a: 1 }, { '.b': 2 }])).toEqual([[{ a: 1 }, { '.b': 2 }]]);
		expect(t.groupJaffleFuncParams([{ a: 1 }, { '.b': 2 }, 42]))
			.toEqual([[{ a: 1 }, { '.b': 2 }], [42]]);
	});

	test('Trying to group bad groups fails', () => {
		expect(() => t.groupJaffleFuncParams([])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams([{ '.a': 42 }])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams([{ '.a': 42 }, { b: 24 }]))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams([24, { '.a': 42 }])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams(['foo', { '.a': 42 }]))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams([[1, 2, 3], { '.a': 42 }]))
			.toThrow(e.BadFunctionJaffleError);
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

	test('Variable definition strings are transpiled into variable definitions', () => {
		expect(t.jaffleStringToJs('=foo')).toBe('_foo');
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

		expect(t.jaffleStringToJs('=a')).toBe('_a');
		expect(t.jaffleStringToJs('=abc')).toBe('_abc');
		expect(t.jaffleStringToJs('=ab + cd')).toBe('_ab + _cd');
		// expect(t.jaffleStringToJs('=a b')).toBe('_a _b');
		expect(t.jaffleStringToJs('=(a+1) - (b*2) / (c**3)')).toBe('(_a+1) - (_b*2) / (_c**3)');
	});

	test('Mini-notation strings are transpiled into a call to mini', () => {
		expect(t.jaffleStringToJs('_foo')).toBe("mini('foo')");
		expect(t.jaffleStringToJs('_foo bar\nbaz')).toBe('mini(`foo bar\nbaz`)');
	});
});

// describe('Testing jaffleParamsToJsGroups()', () => {...});

// describe('Testing jaffleLambdaToJs()', () => {...});

describe('Testing jaffleFuncToJs()', () => {
	test('trying to transpile an empty function fails', () => {
		expect(() => t.jaffleFuncToJs({})).toThrowError(e.BadFunctionJaffleError);
	});

	test('main functions are transpiled into main function call', () => {
		expect(t.jaffleFuncToJs({ foo: 42 })).toBe('foo(42)');
		expect(t.jaffleFuncToJs({ foo: 'bar' })).toBe("foo('bar')");
		expect(t.jaffleFuncToJs({ foo: null })).toBe('foo()');
		expect(t.jaffleFuncToJs({ Foo: null })).toBe('foo');
		expect(t.jaffleFuncToJs({ foo: [1, 2, 3] })).toBe('foo(1, 2, 3)');
		expect(t.jaffleFuncToJs({ foo: [1, [2, 3]] })).toBe('foo(1, [2, 3])');
		expect(t.jaffleFuncToJs({ foo: { bar: 42 } })).toBe('foo(bar(42))');
		expect(t.jaffleFuncToJs({ fo: [{ ba: [1, 2] }, 3, 'b'] })).toBe("fo(ba(1, 2), 3, 'b')");
	});

	test('init functions are transpiled into a call to init functions', () => {
		expect(t.jaffleFuncToJs({ _a: 42 })).toBe('a(42)');
		expect(t.jaffleFuncToJs({ $a: 42 })).toBe('const _a = 42');
	});

	test('aliases functions are transpiled into a call to their alias', () => {
		expect(t.jaffleFuncToJs({ a: '_foo' })).toBe("a(mini('foo'))");
	});

	test('chained functions are transpiled into chained function calls', () => {
		expect(t.jaffleFuncToJs({ a: [{ b: null }, { '.c': null }] })).toBe('a(b().c())');
		expect(t.jaffleFuncToJs({ a: [{ b: 1 }, { '.c': 2 }] })).toBe('a(b(1).c(2))');
		expect(t.jaffleFuncToJs({ a: [{ b: [1, 2] }, { '.c': [3, 4] }] }))
			.toBe('a(b(1, 2).c(3, 4))');
		expect(t.jaffleFuncToJs({ a: [{ b: { c: 1 } }, { '.d': 2 }] })).toBe('a(b(c(1)).d(2))');
		expect(t.jaffleFuncToJs({ a: [{ b: 1 }, { '.c': { d: 2 } }] })).toBe('a(b(1).c(d(2)))');
		expect(t.jaffleFuncToJs({ a: [{ b: 1 }, { '.c': 2 }, { '.d': 3 }] }))
			.toBe('a(b(1).c(2).d(3))');
		expect(t.jaffleFuncToJs({ a: [{ b: 1 }, { '.c': { d: 2 } }, { '.e': 3 }] }))
			.toBe('a(b(1).c(d(2)).e(3))');
		expect(t.jaffleFuncToJs({ a: ['_b', { '.c': 42 }] })).toBe("a(mini('b').c(42))");
	});

	test('trying to transpile bad chained functions fails', () => {
		expect(() => t.jaffleFuncToJs({ a: [1, { '.b': 2 }] })).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleFuncToJs({ a: [null, { '.b': 1 }] }))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleFuncToJs({ a: [[1, 2], { '.b': 3 }] }))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleFuncToJs({ a: ['b', { '.c': 1 }] })).toThrow(e.BadFunctionJaffleError);
	});

	test('serialized functions are transpiled into a function call with serialized param', () => {
		expect(t.jaffleFuncToJs({ 'a^': 1 })).toBe('a(1)');
		expect(t.jaffleFuncToJs({ 'a^': ['b', 'c'] })).toBe("a('b', 'c')");
		expect(t.jaffleFuncToJs({ 'a^': ['b', [1, 2]] })).toBe("a('b', [1,2])");
		expect(t.jaffleFuncToJs({ 'a^': ['b', { c: 3 }] })).toBe("a('b', {'c':3})");
		expect(t.jaffleFuncToJs({ 'a^': ['b', { c: 1, d: 2 }] })).toBe("a('b', {'c':1,'d':2})");
		expect(t.jaffleFuncToJs({ 'a^': { b: { c: 42 } } })).toBe("a({'b':{'c':42}})");
		expect(t.jaffleFuncToJs({ 'a^1': [{ b: { '.c': 1 } }, { d: 2 }, { '.e': 3 }] }))
			.toBe("a({'b':{'.c':1}}, d(2).e(3))");
	});

	test('Lambda functions are transpiled into lambda function calls', () => {
		expect(t.jaffleFuncToJs({ a: [{ set: null }, { '.foo': 42 }] }))
			.toBe('a(x => x.foo(42))');
		expect(t.jaffleFuncToJs({ a: [{ set: 'n' }, { '.fo': '=n-1' }] }))
			.toBe('a((x, n) => x.fo(_n-1))');
		expect(t.jaffleFuncToJs({ a: [{ set: 'nm' }, { '.fo': '=n' }, { '.ba': '=m' }] }))
			.toBe('a((x, n, m) => x.fo(_n).ba(_m))');
	});
});

describe('Testing jaffleListToJs()', () => {
	test('array of items are transpiled into list of items', () => {
		expect(t.jaffleListToJs([null, null])).toBe('[null, null]');
		expect(t.jaffleListToJs([1, 2])).toBe('[1, 2]');
		expect(t.jaffleListToJs(['a', 'b'])).toBe("['a', 'b']");
		expect(t.jaffleListToJs([[1, 2], [3, 4]])).toBe('[[1, 2], [3, 4]]');
		expect(t.jaffleListToJs([{ a: 1 }, { b: 2 }])).toBe('[a(1), b(2)]');
	});
});

describe('Testing jaffleParamToJs()', () => {
	test('Literals transpile into literals', () => {
		expect(t.jaffleParamToJs(null)).toBe('null');
		expect(t.jaffleParamToJs(42)).toBe('42');
		expect(t.jaffleParamToJs('bar')).toBe("'bar'");
	});

	test('Lists transpile into lists', () => {
		expect(t.jaffleParamToJs([])).toBe('[]');
		expect(t.jaffleParamToJs([1, 2, 3])).toBe('[1, 2, 3]');
		expect(t.jaffleParamToJs([42, null, 'foo'])).toBe("[42, null, 'foo']");
	});

	test('Main functions transpile into function calls', () => {
		expect(t.jaffleParamToJs({ foo: 42 })).toBe('foo(42)');
		expect(t.jaffleParamToJs({ foo: [1, 2, 3] })).toBe('foo(1, 2, 3)');
		expect(t.jaffleParamToJs({ foo: null })).toBe('foo()');
		expect(t.jaffleParamToJs({ Foo: null })).toBe('foo');
	});

	test('Chained functions transpile into function calls', () => {
		expect(t.jaffleParamToJs({ '.foo': 42 })).toBe('foo(42)');
		expect(t.jaffleParamToJs({ '.foo': [1, 2, 3] })).toBe('foo(1, 2, 3)');
		expect(t.jaffleParamToJs({ '.foo': null })).toBe('foo()');
		expect(t.jaffleParamToJs({ '.Foo': null })).toBe('foo');
	});

	test('Functions list transpile into list of function calls', () => {
		expect(t.jaffleParamToJs([{ foo: 42 }, { '.bar': 'baz' }])).toBe("[foo(42), bar('baz')]");
	});

	test('Trying to transpile bad functions fails', () => {
		expect(() => t.jaffleParamToJs({})).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing jaffleDocumentToJs()', () => {
	test('Trying to transpile non-valid yaml fails', () => {
		expect(() => t.jaffleDocumentToJs('[foo}')).toThrow(e.BadYamlJaffleError);
	});

	test('Trying to transpile a yaml document without an array on root fails', () => {
		expect(() => t.jaffleDocumentToJs('foo')).toThrow(e.BadDocumentJaffleError);
		expect(() => t.jaffleDocumentToJs('42')).toThrow(e.BadDocumentJaffleError);
		expect(() => t.jaffleDocumentToJs('null')).toThrow(e.BadDocumentJaffleError);
		expect(() => t.jaffleDocumentToJs('{ foo: bar }')).toThrow(e.BadDocumentJaffleError);
	});

	test('Trying to transpile a yaml document containing a bad array on root fails', () => {
		expect(() => t.jaffleDocumentToJs('[{.b: 1}, {a: 2}]')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleDocumentToJs('[{a: 1}, {b: 2}]')).toThrow(e.BadDocumentJaffleError);
		expect(() => t.jaffleDocumentToJs('[]')).toThrow(e.BadDocumentJaffleError);
	});

	test('Yaml documents containing an array of valid functions are transpiled into code', () => {
		expect(t.jaffleDocumentToJs('[{ foo: 42 }]')).toBe('return foo(42);');
		expect(t.jaffleDocumentToJs('[{ foo: bar }]')).toBe("return foo('bar');");
		expect(t.jaffleDocumentToJs('[{ foo: }]')).toBe('return foo();');
		expect(t.jaffleDocumentToJs('[{ foo: [1, 2, 3]}]')).toBe('return foo(1, 2, 3);');
		expect(t.jaffleDocumentToJs('[{ $a: 1 }, { b: =a }]')).toBe('const _a = 1;\nreturn b(_a);');
		expect(t.jaffleDocumentToJs('[{ $a: 1 }, { b: =a }, { .c: 2 }]'))
			.toBe('const _a = 1;\nreturn b(_a).c(2);');
		expect(t.jaffleDocumentToJs("['_abc']")).toBe("return mini('abc');");
		expect(t.jaffleDocumentToJs('[{ _foo: 1 }, { bar: 2 }]')).toBe('foo(1);\nreturn bar(2);');
		expect(t.jaffleDocumentToJs('[{ _a: 1 }, { _b: 2 }, { c: 3 }]'))
			.toBe('a(1);\nb(2);\nreturn c(3);');
	});
});
