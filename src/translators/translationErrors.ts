/* eslint-disable max-classes-per-file */

export class TranslationError extends Error {
	constructor(message: string) {
		super(`${message}.`);
		this.name = TranslationError.name;
	}
}

export class NotImplementedError extends TranslationError {
	constructor(message: string) {
		super(message);
		this.name = NotImplementedError.name;
	}
}

export class LoaderError extends TranslationError {
	constructor(message: string) {
		super(message);
		this.name = LoaderError.name;
	}
}

export class DumperError extends TranslationError {
	constructor(message: string) {
		super(message);
		this.name = DumperError.name;
	}
}
