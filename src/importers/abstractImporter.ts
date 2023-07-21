/* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars */

import { Vertex } from '../funcTree';
import { AbstractClassError } from '../errors';

class AbstractImporter {
	constructor() {
		if (this.constructor === AbstractImporter) {
			throw new AbstractClassError('class AbstractImporter can\'t be instantiated.');
		}
	}

	static import(thing: unknown): Vertex {
		throw new AbstractClassError('Method AI.import() must be implemented.');
	}
}

export default AbstractImporter;
