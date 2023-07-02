import { describe, expect, test } from '@jest/globals';

import * as e from '../src/errors';
import * as t from '../src/transpiler';

describe('Testing serialize()', () => {
	test('literals and arrays are correctly serialized', () => {
		expect(t.serialize(null)).toBe('null');
		expect(t.serialize(42)).toBe('42');
		expect(t.serialize('foo')).toBe("'foo'");
		expect(t.serialize([1, 2, 3])).toBe('[1,2,3]');
	});

	test('Objects are correctly serialized', () => {
		expect(t.serialize({ foo: 42 })).toBe("{'foo':42}");
		expect(t.serialize({ foo: 'bar' })).toBe("{'foo':'bar'}");
		expect(t.serialize({ foo: [1, 2, 3] })).toBe("{'foo':[1,2,3]}");
		expect(t.serialize({ foo: { bar: 42 } })).toBe("{'foo':{'bar':42}}");
		expect(t.serialize({ '.foo': 1, _bar: 2, $baz: 3 })).toBe("{'.foo':1,'_bar':2,'$baz':3}");
		expect(t.serialize({ a: '/1', b: '_2', c: '=3' })).toBe("{'a':'/1','b':'_2','c':'=3'}");
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
		expect(t.isJaffleFunction('_foo')).toBeFalsy();
		expect(t.isJaffleFunction('=foo')).toBeFalsy();
	});
});

describe('Testing getJaffleFuncName()', () => {
	test('The name of a function is the function name', () => {
		expect(t.getJaffleFuncName({ foo: 42 })).toBe('foo');
		expect(t.getJaffleFuncName({ Foo: 42 })).toBe('Foo');
		expect(t.getJaffleFuncName({ '.foo': 42 })).toBe('.foo');
		expect(t.getJaffleFuncName({ $foo: 42 })).toBe('$foo');
		expect(t.getJaffleFuncName({ _foo: 42 })).toBe('_foo');
	});

	test('Trying to get the function name of a non-function fails', () => {
		expect(() => t.getJaffleFuncName({})).toThrow(e.BadFunctionJaffleError);
		expect(() => t.getJaffleFuncName({ foo: 42, bar: 24 })).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing toJaffleFunction()', () => {
	test('An object converted to a Jaffle function is the Jaffle function of the object', () => {
		expect(t.toJaffleFunction({ foo: 42 }).foo).toBe(42);
		expect(t.toJaffleFunction('_foo').mini).toBe('foo');
		expect(t.toJaffleFunction('=foo').expr).toBe('foo');
	});

	test('Converting a non-object to a jaffle function fails', () => {
		expect(() => t.toJaffleFunction(null)).toThrow(e.BadFunctionJaffleError);
		expect(() => t.toJaffleFunction(42)).toThrow(e.BadFunctionJaffleError);
		expect(() => t.toJaffleFunction('foo')).toThrow(e.BadFunctionJaffleError);
		expect(() => t.toJaffleFunction([1, 2, 3])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.toJaffleFunction({})).toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing extractJaffleInitBlock()', () => {
	test('List of init or main functions can be split into one of those functions block', () => {
		expect(t.extractJaffleInitBlock([{ foo: 42 }])).toEqual([[], [{ foo: 42 }]]);
		expect(t.extractJaffleInitBlock([{ _foo: 42 }])).toEqual([[{ _foo: 42 }], []]);
		expect(t.extractJaffleInitBlock([{ $foo: 42 }])).toEqual([[{ $foo: 42 }], []]);
	});

	test('List of mixed functions can be split into an init block and a main block', () => {
		expect(t.extractJaffleInitBlock([{ _a: 1 }, { b: 2 }])).toEqual([[{ _a: 1 }], [{ b: 2 }]]);
		expect(t.extractJaffleInitBlock([{ b: 2 }, { _a: 1 }])).toEqual([[{ _a: 1 }], [{ b: 2 }]]);
		expect(t.extractJaffleInitBlock([{ _a: 1 }, { $b: 2 }, { c: 3 }, { d: 4 }]))
			.toEqual([[{ _a: 1 }, { $b: 2 }], [{ c: 3 }, { d: 4 }]]);
		expect(t.extractJaffleInitBlock([{ c: 3 }, { _a: 1 }, { d: 4 }, { $b: 2 }]))
			.toEqual([[{ _a: 1 }, { $b: 2 }], [{ c: 3 }, { d: 4 }]]);
	});
});

describe('Testing getJaffleFuncParams()', () => {
	test('Null value passed in Jaffle function parameters is an empty array', () => {
		expect(t.getJaffleFuncParams(null)).toEqual([]);
	});

	test('Literals passed in Jaffle function parameters are an array of one literal', () => {
		expect(t.getJaffleFuncParams(null)).toEqual([]);
		expect(t.getJaffleFuncParams(42)).toEqual([42]);
		expect(t.getJaffleFuncParams('foo')).toEqual(['foo']);
	});

	test('Object passed in Jaffle function parameters are an array of one object', () => {
		expect(t.getJaffleFuncParams({ a: null, b: 42, c: 'foo' }))
			.toEqual([{ a: null, b: 42, c: 'foo' }]);
	});

	test('Arrays passed in Jaffle function parameters are an array', () => {
		expect(t.getJaffleFuncParams([null, 42, 'foo'])).toEqual([null, 42, 'foo']);
		expect(t.getJaffleFuncParams([])).toEqual([]);
		expect(t.getJaffleFuncParams([null])).toEqual([]);
	});
});

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
		expect(t.groupJaffleFuncParams([{ a: 1 }, { '.b': 2 }, 3, 'c', null]))
			.toEqual([[{ a: 1 }, { '.b': 2 }], [3], ['c'], [null]]);
		expect(t.groupJaffleFuncParams([{ a: 1 }, { '.b': 'c' }, { '.d': null }, { '.e': [1, 2] }]))
			.toEqual([[{ a: 1 }, { '.b': 'c' }, { '.d': null }, { '.e': [1, 2] }]]);
		expect(t.groupJaffleFuncParams([{ a: 1 }, { '.b': 2 }, { c: 3 }, { '.d': 'e' }]))
			.toEqual([[{ a: 1 }, { '.b': 2 }], [{ c: 3 }, { '.d': 'e' }]]);
		expect(t.groupJaffleFuncParams(['_a', { '.b': 1 }])).toEqual([['_a', { '.b': 1 }]]);
		expect(t.groupJaffleFuncParams(['=a', { '.b': 1 }])).toEqual([['=a', { '.b': 1 }]]);
	});

	test('serialized parameters are grouped into groups of serialized parameters', () => {
		expect(t.groupJaffleFuncParams([{ a: 1 }, { '.b': 2 }, { _c: 3 }], -2))
			.toEqual([[{ a: 1 }], [{ '.b': 2 }], [{ _c: 3 }]]);
		expect(t.groupJaffleFuncParams([{ a: 1 }, { '.b': 2 }, { _c: 3 }], -1))
			.toEqual([[{ a: 1 }, { '.b': 2 }], [{ _c: 3 }]]);
		expect(t.groupJaffleFuncParams([{ a: 1 }, { '.b': 2 }], 1))
			.toEqual([[{ a: 1 }], [{ '.b': 2 }]]);
	});

	test('Trying to group bad groups fails', () => {
		expect(() => t.groupJaffleFuncParams([])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams([{ '.a': 1 }])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams([{ '.a': 1 }, { b: 2 }]))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams([null, { '.a': 2 }]))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams([1, { '.a': 2 }])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams(['a', { '.b': 1 }])).toThrow(e.BadFunctionJaffleError);
		expect(() => t.groupJaffleFuncParams([[1, 2], { '.a': 1 }]))
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

	test('Expression strings are transpiled into expressions', () => {
		expect(t.jaffleStringToJs('=foo')).toBe('_foo');
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
		expect(t.jaffleStringToJs('=a b')).toBe('_a _b');
		expect(t.jaffleStringToJs('=(a+1) - (b*2) / (c**3)')).toBe('(_a+1) - (_b*2) / (_c**3)');
	});

	test('Mini-notation strings are transpiled into a call to mini', () => {
		expect(t.jaffleStringToJs('_foo')).toBe("mini('foo')");
		expect(t.jaffleStringToJs('_foo bar\nbaz')).toBe('mini(`foo bar\nbaz`)');
	});
});

describe('Testing jaffleParamsToJsGroups()', () => {
	test('Params are transpiled into groups', () => {
		expect(t.jaffleParamsToJsGroups([{ a: 1 }])).toEqual(['a(1)']);
		expect(t.jaffleParamsToJsGroups([{ a: 1 }, { b: 2 }])).toEqual(['a(1)', 'b(2)']);
		expect(t.jaffleParamsToJsGroups([{ a: 1 }, { '.b': 2 }])).toEqual(['a(1).b(2)']);
		expect(t.jaffleParamsToJsGroups([{ a: 1 }, null, 42, 'foo', [1, 2, 3]]))
			.toEqual(['a(1)', 'null', '42', "'foo'", '[1, 2, 3]']);
		expect(t.jaffleParamsToJsGroups(['_foo', { '.bar': 42 }]))
			.toEqual(["mini('foo').bar(42)"]);
		expect(t.jaffleParamsToJsGroups([{ a: 1 }, { '.b': 2 }, { c: 3 }]))
			.toEqual(['a(1).b(2)', 'c(3)']);
		expect(t.jaffleParamsToJsGroups([{ a: 1 }, { '.b': 2 }, { c: [{ d: 3 }] }]))
			.toEqual(['a(1).b(2)', 'c(d(3))']);
	});

	test('Empty params are transpiled into empty groups', () => {
		expect(t.jaffleParamsToJsGroups([])).toEqual([]);
	});

	test('Serialized params are transpiled into serialized groups', () => {
		expect(t.jaffleParamsToJsGroups([{ a: 1 }, { '.b': 2 }, { c: [{ d: 3 }] }], ''))
			.toEqual(["{'a':1}", "{'.b':2}", "{'c':[{'d':3}]}"]);
		expect(t.jaffleParamsToJsGroups([{ a: 1 }, { '.b': 2 }, { c: [{ d: 3 }] }], '2'))
			.toEqual(['a(1)', "{'.b':2}", 'c(d(3))']);
	});

	test('Trying to serialize bad groups fails', () => {
		expect(() => t.jaffleParamsToJsGroups([{ a: 1 }, { '.b': 2 }, { c: [{ d: 3 }] }], '1'))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleParamsToJsGroups([{ a: 1 }, { '.b': 2 }, { c: [{ d: 3 }] }], '3'))
			.toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing jaffleLambdaToJs()', () => {
	test('lambda functions are transpiled to lambda functions', () => {
		expect(t.jaffleLambdaToJs([])).toBe('_x_ => _x_');
		expect(t.jaffleLambdaToJs(['n'])).toBe('(_x_, _n) => _x_');
		expect(t.jaffleLambdaToJs(['my_awesomeVar42'])).toBe('(_x_, _my_awesomeVar42) => _x_');
		expect(t.jaffleLambdaToJs(['x', 'y', 'z'])).toBe('(_x_, _x, _y, _z) => _x_');
	});

	test('trying to transpile bad lambda functions fails', () => {
		expect(() => t.jaffleLambdaToJs(['bad var']))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleLambdaToJs(['BadVar']))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleLambdaToJs(['42badVar']))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleLambdaToJs(['bad+var']))
			.toThrow(e.BadFunctionJaffleError);
	});
});

describe('Testing jaffleFuncToJs()', () => {
	test('trying to transpile an empty function fails', () => {
		expect(() => t.jaffleFuncToJs({})).toThrowError(e.BadFunctionJaffleError);
	});

	test('main functions are transpiled into main function calls', () => {
		expect(t.jaffleFuncToJs({ foo: 42 })).toBe('foo(42)');
		expect(t.jaffleFuncToJs({ foo: 'bar' })).toBe("foo('bar')");
		expect(t.jaffleFuncToJs({ foo: null })).toBe('foo()');
		expect(t.jaffleFuncToJs({ Foo: null })).toBe('foo');
		expect(t.jaffleFuncToJs({ foo: [1, 2, 3] })).toBe('foo(1, 2, 3)');
		expect(t.jaffleFuncToJs({ foo: [1, [2, 3]] })).toBe('foo(1, [2, 3])');
		expect(t.jaffleFuncToJs({ foo: { bar: 42 } })).toBe('foo(bar(42))');
		expect(t.jaffleFuncToJs({ fo: [{ ba: [1, 2] }, 3, 'b'] })).toBe("fo(ba(1, 2), 3, 'b')");
		expect(t.jaffleFuncToJs({ a: '_foo' })).toBe("a(mini('foo'))");
	});

	test('init functions are transpiled into a call to init functions', () => {
		expect(t.jaffleFuncToJs({ _a: 42 })).toBe('a(42)');
		expect(t.jaffleFuncToJs({ $a: 42 })).toBe('const _a = 42');
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
		expect(t.jaffleFuncToJs({ a: [{ set: null }] })).toBe('a(_x_ => _x_)');
		expect(t.jaffleFuncToJs({ a: [{ set: null }, { '.foo': 42 }] }))
			.toBe('a(_x_ => _x_.foo(42))');
		expect(t.jaffleFuncToJs({ a: [{ set: 'var' }, { '.fo': '=var-1' }] }))
			.toBe('a((_x_, _var) => _x_.fo(_var-1))');
		expect(t.jaffleFuncToJs({ a: [{ set: ['n', 'm'] }, { '.fo': '=n' }, { '.ba': '=m' }] }))
			.toBe('a((_x_, _n, _m) => _x_.fo(_n).ba(_m))');
	});

	test('trying to transpile bad functions fails', () => {
		expect(() => t.jaffleFuncToJs({ a: [{ set: [42] }] })).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleFuncToJs({ a: [{ set: ['Bad'] }] })).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleFuncToJs({ a: [1, { '.b': 2 }] })).toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleFuncToJs({ a: [null, { '.b': 1 }] }))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleFuncToJs({ a: [[1, 2], { '.b': 3 }] }))
			.toThrow(e.BadFunctionJaffleError);
		expect(() => t.jaffleFuncToJs({ a: ['b', { '.c': 1 }] })).toThrow(e.BadFunctionJaffleError);
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
		expect(t.jaffleParamToJs({ foo: '_bar' })).toBe("foo(mini('bar'))");
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
	test('Yaml documents containing an array of valid functions are transpiled into code', () => {
		expect(t.jaffleDocumentToJs('[{ foo: 42 }]')).toBe('return foo(42);');
		expect(t.jaffleDocumentToJs('[{ foo: bar }]')).toBe("return foo('bar');");
		expect(t.jaffleDocumentToJs('[{ foo: }]')).toBe('return foo();');
		expect(t.jaffleDocumentToJs('[{ foo: [1, 2, 3]}]')).toBe('return foo(1, 2, 3);');
		expect(t.jaffleDocumentToJs('[{ $a: 1 }, { b: =a }]')).toBe('const _a = 1;\nreturn b(_a);');
		expect(t.jaffleDocumentToJs('[{ $a: 1 }, { b: =a }, { .c: 2 }]'))
			.toBe('const _a = 1;\nreturn b(_a).c(2);');
		expect(t.jaffleDocumentToJs("[{ $a: 1 }, { b: [ '=a', { .c: 2 }] }]"))
			.toBe('const _a = 1;\nreturn b(_a.c(2));');
		expect(t.jaffleDocumentToJs("['_abc']")).toBe("return mini('abc');");
		expect(t.jaffleDocumentToJs('[{ _foo: 1 }, { bar: 2 }]')).toBe('foo(1);\nreturn bar(2);');
		expect(t.jaffleDocumentToJs('[{ _a: 1 }, { _b: 2 }, { c: 3 }]'))
			.toBe('a(1);\nb(2);\nreturn c(3);');
	});

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
});
