/* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars */

import { NotImplementedError } from './translationErrors';

class AbstractLoader {
	constructor() {
		if (this.constructor === AbstractLoader) {
			throw new NotImplementedError('class AbstractLoader can\'t be instantiated.');
		}
	}

	public dump(input: string): void {
		throw new NotImplementedError('Method load() must be implemented.');
	}
}

export default AbstractLoader;
