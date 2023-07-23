import { Entry, Box } from './model';
import importYaml from './importers/yamlImporter';
import importBox from './importers/boxImporter';
import boxToGraphBox from './exporters/boxExporter';

export default class Converter {
	readonly entry: Entry;

	constructor(entry: Entry) {
		this.entry = entry;
	}

	static fromYaml(yaml: string): Converter {
		return new Converter(importYaml(yaml));
	}

	static fromBox(box: Box): Converter {
		return new Converter(importBox(box));
	}

	toEntry(): Entry {
		return this.entry;
	}

	toBox(): Box {
		return boxToGraphBox(this.entry);
	}
}
