import { Box } from '../dataTypes/box';
import { GraphBox } from '../dataTypes/graphBox';
import yamlToBox from '../importers/yamlImporter';
import graphBoxToBox from '../importers/graphImporter';
import boxToGraphBox from '../exporters/graphExporter';

export default class BoxHelper {
	readonly box: Box;

	constructor(box: Box) {
		this.box = box;
	}

	static fromYaml(yaml: string): BoxHelper {
		return new BoxHelper(yamlToBox(yaml));
	}

	static fromGraph(graph: GraphBox): BoxHelper {
		return new BoxHelper(graphBoxToBox(graph));
	}

	toBox(): Box {
		return this.box;
	}

	toGraph(): GraphBox {
		return boxToGraphBox(this.box);
	}
}
