/* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars */

import { FuncTree } from '../funcTree';
import { AbstractClassError } from '../errors';

class AbstractExporter {
	constructor() {
		if (this.constructor === AbstractExporter) {
			throw new AbstractClassError('class AbstractDumper can\'t be instantiated.');
		}
	}

	public export(composition: FuncTree): unknown {
		throw new AbstractClassError('Method dump() must be implemented.');
	}
}

export default AbstractExporter;
