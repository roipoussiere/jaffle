import { dump as dumpYaml } from 'js-yaml';

import { FuncTree, ValueType } from '../funcTree';

import AbstractExporter from './abstractExporter';

interface Dict<T> {
	[key: string]: T;
}

class YamlExporter extends AbstractExporter {
	static export(composition: FuncTree): string {
		const yamlTree = YamlExporter.arrangeFunc(composition);
		return dumpYaml(yamlTree);
	}

	static arrangeFunc(funcTree: FuncTree): Dict<unknown> {
		const value = funcTree.valueType === ValueType.Tree
			? funcTree.params.map((param) => YamlExporter.arrangeFunc(param)) : funcTree.value;
		return { [funcTree.name]: value };
	}
}

export default YamlExporter;
