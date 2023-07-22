import { Vertex, VertexType } from '../dataTypes/vertex';
import * as c from '../constants';

/**
 * Serialise an object to JSON.
 * @param thing the object to serialize
 * @returns a string reprensenting the object in JSON
 */
function serialize(thing: unknown): string {
	return JSON.stringify(thing);
}

export function vertexToJs(func: Vertex): string {
	const params = func.children.map((param) => vertexToJs(param));
	let js: string;

	if (func.type === VertexType.MainFunc) {
		js = `${func.value}(${params.join(', ')})`;
	} else if (func.type === VertexType.ChainedFunc) {
		js = `.${func.value}(${params.join(', ')})`;
	} else if (func.type === VertexType.ConstantDef) {
		js = `const ${c.VAR_NAME_PREFIX}${func.value} = ${params[0]};`;
	// } else if (func.type === VertexType.List) {
	// 	js = `[${params.join(', ')}]`;
	} else if (func.type === VertexType.Literal) {
		js = typeof func.value === 'string' ? `'${func.value}'` : `${func.value}`;
	// } else if (func.type === VertexType.Expression) {
	// 	js = `${c.VAR_NAME_PREFIX}${func.value}`;
	// } else if (func.type === VertexType.Mininotation) {
	// 	js = `mini(${func.value})`;
	} else {
		js = serialize(func.value);
	}
	return js;
}

export default vertexToJs;
