import { RawBox, VBox } from '../boxInterfaces';
import yamlToBox from '../importers/yamlImporter';
import vBoxToBox from '../importers/graphImporter';
import boxToGraphBox from '../exporters/graphExporter';

export default class BoxHelper {
	readonly box: RawBox;

	constructor(box: RawBox) {
		this.box = box;
	}

	static fromYaml(yaml: string): BoxHelper {
		return new BoxHelper(yamlToBox(yaml));
	}

	static fromGraph(graph: VBox): BoxHelper {
		return new BoxHelper(vBoxToBox(graph));
	}

	toBox(): RawBox {
		return this.box;
	}

	toGraph(): VBox {
		return boxToGraphBox(this.box);
	}
}
