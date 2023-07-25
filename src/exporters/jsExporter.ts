import { AstNode, BoxType, Entry } from '../model';
import * as c from '../constants';
import entryToAstNode from './astNodeExporter';

/**
 * Serialise an object to JSON.
 * @param thing the object to serialize
 * @returns a string reprensenting the object in JSON
 */
export function serialize(thing: unknown): string {
	return JSON.stringify(thing);
}

export function astNodeToJs(astNode: AstNode): string {
	const groups: Array<Array<AstNode>> = [];
	astNode.children.forEach((child) => {
		if (child.type !== BoxType.ChainedFunc) {
			groups.push([child]);
		} else {
			groups[groups.length - 1].push(child);
		}
	});
	let js: string;

	const jsParams = groups.map(
		(group) => group.map((child) => astNodeToJs(child)).join(''),
	);

	if (astNode.type === BoxType.MainFunc) {
		js = `${astNode.value}(${jsParams.join(', ')})`;
	} else if (astNode.type === BoxType.ChainedFunc) {
		js = `.${astNode.value}(${jsParams.join(', ')})`;
	} else if (astNode.type === BoxType.ConstantDef) {
		js = `const ${c.VAR_NAME_PREFIX}${astNode.value} = ${jsParams[0]};`;
	// } else if (func.type === BoxType.List) {
	// 	js = `[${params.join(', ')}]`;
	} else if (astNode.type === BoxType.Value) {
		js = typeof astNode.value === 'string' ? `'${astNode.value}'` : `${astNode.value}`;
	} else {
		js = serialize(astNode.value);
	}
	return js;
}

export function entryToJs(entry: Entry): string {
	const astNode = entryToAstNode(entry);
	return astNodeToJs(astNode);
}

export default entryToJs;
