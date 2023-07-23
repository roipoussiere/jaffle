/* eslint-disable max-classes-per-file */
import { JaffleError } from '../errors';

export class ExporterError extends JaffleError {
	constructor(message: string) {
		super(message);
		this.name = ExporterError.name;
	}
}

export class AstNodeExporterError extends ExporterError {
	constructor(message: string) {
		super(message);
		this.name = AstNodeExporterError.name;
	}
}

export class BoxExporterError extends ExporterError {
	constructor(message: string) {
		super(message);
		this.name = BoxExporterError.name;
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
