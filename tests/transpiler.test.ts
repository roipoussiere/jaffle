import { transpiler, errors } from '../src';

test('Non-valid yaml should fail', () => {
	expect(transpiler(`
- c@3 eb
  note:
`)).toThrow(errors.JaffleErrorBadYaml);
});

test('Empty root should return nothing', () => {
	expect(transpiler(`

`)).toBe('return;');
});

test('Number on root should fail', () => {
	expect(transpiler(`
42
`)).toThrow(errors.JaffleErrorBadType);
});

test('String on root should fail', () => {
	expect(transpiler(`
c@3 eb
`)).toThrow(errors.JaffleErrorBadType);
});

test('Array starting with mini on root should play', () => {
	expect(transpiler(`
- c@3 eb
- note:
`)).toBe('mini(`c@3 eb`).note()');
});

test('Array not starting with mini on root should fail', () => {
	expect(transpiler(`
- note:
- c@3 eb
`)).toThrow(errors.JaffleErrorMainAttr);
});

test('Array with several minis on root should fail', () => {
	expect(transpiler(`
- c@3 eb
- eb@3 c
`)).toThrow('Main attribute should be unique.');
});

test('Main attribute directly on root should play', () => {
	expect(transpiler(`
Note: c@3 eb
`)).toBe("note(mini('c@3 eb'))");
});

test('Several attributes directly on root should fail', () => {
	expect(transpiler(`
Note: c@3 eb
s: sd*2 oh
`)).toThrow('Missing main attribute.');
});
