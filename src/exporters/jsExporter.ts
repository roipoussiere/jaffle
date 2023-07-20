// eslint-disable-next-line max-classes-per-file
import { Vertex, VertexType } from '../funcTree';
import { ExporterError } from '../errors';
// import * as c from '../constants';

import AbstractExporter from './abstractExporter';

const VAR_NAME_PREFIX = '_';
// const LAMBDA_NAME = 'set';
// const LAMBDA_VAR = '_x_';

export class JsExporterError extends ExporterError {
	constructor(message: string) {
		super(message);
		this.name = JsExporterError.name;
	}
}

export class JsExporter extends AbstractExporter {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
	public export(composition: Vertex): string {
		return JsExporter.funcToJs(composition);
	}

	static funcToJs(func: Vertex): string {
		const params = func.children.map((param) => JsExporter.funcToJs(param));
		let js: string;

		if (func.type === VertexType.Func) {
			js = `${func.value}(${params.join(', ')})`;
		} else if (func.type === VertexType.ChainedFunc) {
			js = `.${func.value}(${params.join(', ')})`;
		} else if (func.type === VertexType.ConstantDef) {
			js = `const ${VAR_NAME_PREFIX}${func.value} = ${params[0]};`;
		} else if (func.type === VertexType.List) {
			js = `[${params.join(', ')}]`;
		} else if (func.type === VertexType.Literal) {
			js = typeof func.value === 'string' ? `'${func.value}'` : `${func.value}`;
		} else if (func.type === VertexType.ExpressionFunc) {
			js = `${VAR_NAME_PREFIX}${func.value}`;
		} else if (func.type === VertexType.MininotationFunc) {
			js = `mini(${func.value})`;
		} else {
			js = JsExporter.serialize(func.value);
		}
		return js;
	}

	/**
	 * Serialise an object to JSON.
	 * @param thing the object to serialize
	 * @returns a string reprensenting the object in JSON
	 */
	static serialize(thing: unknown): string {
		return JSON.stringify(thing);
	}
}

export default JsExporter;
