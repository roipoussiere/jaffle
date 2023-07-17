/* eslint-disable max-classes-per-file */
import { FuncTree } from '../funcTree';
import { ImporterError } from '../errors';
import { BoxTree } from '../exporters/graphExporter';

import AbstractImporter from './abstractImporter';

export class GraphImporterError extends ImporterError {
	constructor(message: string) {
		super(message);
		this.name = GraphImporterError.name;
	}
}

export class GraphImporter extends AbstractImporter {
	static import(graph: BoxTree): FuncTree {
		return GraphImporter.getFunc(graph);
	}

	static getFunc(boxTree: BoxTree): FuncTree {
		return {
			name: boxTree.funcText,
			type: boxTree.funcType,
			value: boxTree.valueText,
			valueType: boxTree.valueType,
			params: boxTree.children.map((child) => GraphImporter.getFunc(child)),
		};
	}
}
