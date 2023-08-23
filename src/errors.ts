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
