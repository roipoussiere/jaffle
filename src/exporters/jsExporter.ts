import { Vertex, BoxType } from '../boxInterfaces';
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

	if (func.type === BoxType.MainFunc) {
		js = `${func.value}(${params.join(', ')})`;
	} else if (func.type === BoxType.ChainedFunc) {
		js = `.${func.value}(${params.join(', ')})`;
	} else if (func.type === BoxType.ConstantDef) {
		js = `const ${c.VAR_NAME_PREFIX}${func.value} = ${params[0]};`;
	// } else if (func.type === BoxType.List) {
	// 	js = `[${params.join(', ')}]`;
	} else if (func.type === BoxType.Value) {
		js = typeof func.value === 'string' ? `'${func.value}'` : `${func.value}`;
	// } else if (func.type === BoxType.Expression) {
	// 	js = `${c.VAR_NAME_PREFIX}${func.value}`;
	// } else if (func.type === BoxType.Mininotation) {
	// 	js = `mini(${func.value})`;
	} else {
		js = serialize(func.value);
	}
	return js;
}

export default vertexToJs;
