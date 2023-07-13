/* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars */

import { NotImplementedError } from './translationErrors';

class AbstractDumper {
	constructor() {
		if (this.constructor === AbstractDumper) {
			throw new NotImplementedError('class AbstractDumper can\'t be instantiated.');
		}
	}

	public dump(input: string): void {
		throw new NotImplementedError('Method dump() must be implemented.');
	}
}

export default AbstractDumper;
