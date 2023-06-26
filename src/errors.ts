/* eslint-disable max-classes-per-file */

export class JaffleError extends Error {
	constructor(message: string) {
		super(`${message}.`);
		this.name = JaffleError.name;
	}
}

export class NotImplementedJaffleError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = NotImplementedJaffleError.name;
	}
}

export class BadYamlJaffleError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = BadYamlJaffleError.name;
	}
}

export class BadTypeJaffleError extends JaffleError {
	constructor(expecting: string, got: string) {
		super(`expecting ${expecting} but got ${got}`);
		this.name = BadTypeJaffleError.name;
	}
}

export class BadFunctionJaffleError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = BadFunctionJaffleError.name;
	}
}

export class BadListJaffleError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = BadListJaffleError.name;
	}
}

export class BadInitBlockJaffleError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = BadInitBlockJaffleError.name;
	}
}

export class BadDocumentJaffleError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = BadInitBlockJaffleError.name;
	}
}
