/* eslint-disable max-classes-per-file */

export class JaffleError extends Error {
	constructor(message: string) {
		super(`${message}.`);
		this.name = JaffleError.name;
	}
}

export class NotImplementedError extends JaffleError {
	constructor(thingName: string) {
		super(`${thingName} is not implemented`);
		this.name = NotImplementedError.name;
	}
}

export class UndefError extends JaffleError {
	constructor(thingName = '') {
		super(`${thingName === '' ? 'class attribute' : thingName} is not defined`);
		this.name = UndefError.name;
	}
}

export class ExporterError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = ExporterError.name;
	}
}

export class ImporterError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = ImporterError.name;
	}
}

// todo: remove from here

export class BadYamlJaffleError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = BadYamlJaffleError.name;
	}
}

export class BadStringJaffleError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = BadStringJaffleError.name;
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

export class BadDocumentJaffleError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = BadDocumentJaffleError.name;
	}
}
