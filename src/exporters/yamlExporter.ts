// eslint-disable-next-line max-classes-per-file
import { dump as dumpYaml } from 'js-yaml';

import { Vertex } from '../dataTypes/vertex';
import { Dict } from '../dataTypes/box';

import Exporter from './exporterInterface';

function arrangeFunc(funcTree: Vertex): Dict<unknown> {
	const value = funcTree.children.length > 1
		? funcTree.children.map((param) => arrangeFunc(param)) : funcTree.value;
	return { [`${funcTree.value}`]: value };
}

const YamlExporter: Exporter = {
	export(composition: Vertex): string {
		const yamlTree = arrangeFunc(composition);
		return dumpYaml(yamlTree);
	},
};

export default YamlExporter;
