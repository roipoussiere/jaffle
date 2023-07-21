// eslint-disable-next-line max-classes-per-file
import { dump as dumpYaml } from 'js-yaml';

import { Vertex } from '../dataTypes/vertex';
import { Dict } from '../dataTypes/box';

import AbstractExporter from './abstractExporter';

class YamlExporter extends AbstractExporter {
	static export(composition: Vertex): string {
		const yamlTree = YamlExporter.arrangeFunc(composition);
		return dumpYaml(yamlTree);
	}

	static arrangeFunc(funcTree: Vertex): Dict<unknown> {
		const value = funcTree.children.length > 1
			? funcTree.children.map((param) => YamlExporter.arrangeFunc(param)) : funcTree.value;
		return { [`${funcTree.value}`]: value };
	}
}

export default YamlExporter;
