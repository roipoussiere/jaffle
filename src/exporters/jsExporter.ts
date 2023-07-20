// eslint-disable-next-line max-classes-per-file
import { FuncTree, FuncType } from '../funcTree';
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
	public export(composition: FuncTree): string {
		return JsExporter.funcToJs(composition);
	}

	static funcToJs(func: FuncTree): string {
		const params = func.params.map((param) => JsExporter.funcToJs(param));
		let js: string;

		if (func.type === FuncType.Main) {
			js = `${func.name}(${params.join(', ')})`;
		} else if (func.type === FuncType.Chained) {
			js = `.${func.name}(${params.join(', ')})`;
		} else if (func.type === FuncType.Constant) {
			js = `const ${VAR_NAME_PREFIX}${func.name} = ${params[0]};`;
		} else if (func.type === FuncType.List) {
			js = `[${params.join(', ')}]`;
		} else if (func.type === FuncType.Literal) {
			js = `[${params.join(', ')}]`;
		} else if (func.type === FuncType.MainExpression) {
			js = `${VAR_NAME_PREFIX}${func.name}`;
		} else if (func.type === FuncType.MainMininotation) {
			js = `mini(${func.name})`;
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
