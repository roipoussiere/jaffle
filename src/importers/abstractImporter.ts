/* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars */

import { FuncTree } from '../funcTree';
import { AbstractClassError } from '../errors';

class AbstractImporter {
	constructor() {
		if (this.constructor === AbstractImporter) {
			throw new AbstractClassError('class AbstractLoader can\'t be instantiated.');
		}
	}

	public import(thing: unknown): FuncTree {
		throw new AbstractClassError('Method load() must be implemented.');
	}
}

export default AbstractImporter;
