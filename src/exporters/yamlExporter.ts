// eslint-disable-next-line max-classes-per-file
import { dump as dumpYaml } from 'js-yaml';

import { FuncTree, ValueType } from '../funcTree';
import { ExporterError } from '../errors';

import AbstractExporter from './abstractExporter';

interface Dict<T> {
	[key: string]: T;
}

export class YamlExporterError extends ExporterError {
	constructor(message: string) {
		super(message);
		this.name = YamlExporterError.name;
	}
}

export class YamlExporter extends AbstractExporter {
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
