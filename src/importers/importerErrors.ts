/* eslint-disable max-classes-per-file */
import { JaffleError } from '../errors';

export class ImporterError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = ImporterError.name;
	}
}

export class BoxTreeImporterError extends ImporterError {
	constructor(message: string) {
		super(message);
		this.name = BoxTreeImporterError.name;
	}
}

export class YamlImporterError extends ImporterError {
	constructor(message: string) {
		super(message);
		this.name = YamlImporterError.name;
	}
}

export class GraphImporterError extends ImporterError {
	constructor(message: string) {
		super(message);
		this.name = GraphImporterError.name;
	}
}
