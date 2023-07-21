/* eslint-disable max-classes-per-file */
import { JaffleError } from '../errors';

export class ExporterError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = ExporterError.name;
	}
}

export class GraphExporterError extends ExporterError {
	constructor(message: string) {
		super(message);
		this.name = GraphExporterError.name;
	}
}

export class JsExporterError extends ExporterError {
	constructor(message: string) {
		super(message);
		this.name = JsExporterError.name;
	}
}

export class YamlExporterError extends ExporterError {
	constructor(message: string) {
		super(message);
		this.name = YamlExporterError.name;
	}
}
