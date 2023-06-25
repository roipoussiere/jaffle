/* eslint-disable max-classes-per-file */

export class JaffleError extends Error {
	constructor(message: string) {
		super(`Jaffle error: ${message}.`);
		this.name = JaffleError.name;
	}
}

export class JaffleErrorBadYaml extends JaffleError {
	constructor(message: string) {
		super(`bad yaml syntax: ${message}`);
		this.name = JaffleErrorBadYaml.name;
	}
}

export class JaffleErrorNotImplemented extends JaffleError {
	constructor() {
		super('not implemented yet');
		this.name = JaffleErrorNotImplemented.name;
	}
}

export class JaffleErrorBadType extends JaffleError {
	constructor(expecting: string, got: string) {
		super(`bad type: expecting ${expecting} but got ${got}`);
		this.name = JaffleErrorBadType.name;
	}
}

export class JaffleAttributeError extends JaffleError {
	constructor(message: string) {
		super(`attribute error: ${message}`);
		this.name = JaffleAttributeError.name;
	}
}

export class JaffleErrorMainAttr extends JaffleError {
	constructor(message: string) {
		super(`main attribute ${message}`);
		this.name = JaffleErrorMainAttr.name;
	}
}
