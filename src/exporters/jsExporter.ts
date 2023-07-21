import { Vertex, VertexType } from '../dataTypes/vertex';
// import * as c from '../constants';

import Exporter from './exporterInterface';

const VAR_NAME_PREFIX = '_';
// const LAMBDA_NAME = 'set';
// const LAMBDA_VAR = '_x_';

/**
 * Serialise an object to JSON.
 * @param thing the object to serialize
 * @returns a string reprensenting the object in JSON
 */
function serialize(thing: unknown): string {
	return JSON.stringify(thing);
}

function funcToJs(func: Vertex): string {
	const params = func.children.map((param) => funcToJs(param));
	let js: string;

	if (func.type === VertexType.MainFunc) {
		js = `${func.value}(${params.join(', ')})`;
	} else if (func.type === VertexType.ChainedFunc) {
		js = `.${func.value}(${params.join(', ')})`;
	} else if (func.type === VertexType.ConstantDef) {
		js = `const ${VAR_NAME_PREFIX}${func.value} = ${params[0]};`;
	// } else if (func.type === VertexType.List) {
	// 	js = `[${params.join(', ')}]`;
	} else if (func.type === VertexType.Literal) {
		js = typeof func.value === 'string' ? `'${func.value}'` : `${func.value}`;
	} else if (func.type === VertexType.Expression) {
		js = `${VAR_NAME_PREFIX}${func.value}`;
	} else if (func.type === VertexType.Mininotation) {
		js = `mini(${func.value})`;
	} else {
		js = serialize(func.value);
	}
	return js;
}

const JsExporter: Exporter = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
	export(composition: Vertex): string {
		return funcToJs(composition);
	},
};

export default JsExporter;
