import { Box } from '../dataTypes/box';
import { buildBoxFromYaml } from '../importers/yamlImporter';

export default class BoxHelper {
	readonly box: Box;

	constructor(box: Box) {
		this.box = box;
	}

	static fromYaml(yaml: string): BoxHelper {
		return new BoxHelper(buildBoxFromYaml(yaml));
	}

	toBox(): Box {
		return this.box;
	}
}
