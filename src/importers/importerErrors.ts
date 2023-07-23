/* eslint-disable max-classes-per-file */
import { JaffleError } from '../errors';

export class ImporterError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = ImporterError.name;
	}
}

export class AstNodeImporterError extends ImporterError {
	constructor(message: string) {
		super(message);
		this.name = AstNodeImporterError.name;
	}
}

export class BoxImporterError extends ImporterError {
	constructor(message: string) {
		super(message);
		this.name = BoxImporterError.name;
	}
}

export class YamlImporterError extends ImporterError {
	constructor(message: string) {
		super(message);
		this.name = YamlImporterError.name;
	}
}
