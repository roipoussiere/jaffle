/* eslint-disable max-classes-per-file */

export class JaffleError extends Error {
	constructor(message: string) {
		super(`${message}.`);
		this.name = JaffleError.name;
	}
}

export class JaffleErrorBadYaml extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = JaffleErrorBadYaml.name;
	}
}

export class JaffleErrorNotImplemented extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = JaffleErrorNotImplemented.name;
	}
}

export class JaffleErrorBadType extends JaffleError {
	constructor(expecting: string, got: string) {
		super(`expecting ${expecting} but got ${got}`);
		this.name = JaffleErrorBadType.name;
	}
}

export class JaffleAttributeError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = JaffleAttributeError.name;
	}
}

export class JaffleErrorMainAttr extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = JaffleErrorMainAttr.name;
	}
}
