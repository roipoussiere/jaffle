/* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars */

import { FuncTree } from '../funcTree';
import { AbstractClassError } from '../errors';

class AbstractExporter {
	constructor() {
		if (this.constructor === AbstractExporter) {
			throw new AbstractClassError('class AbstractExporter can\'t be instantiated.');
		}
	}

	static export(composition: FuncTree): unknown {
		throw new AbstractClassError('Method AE.export() must be implemented.');
	}
}

export default AbstractExporter;
