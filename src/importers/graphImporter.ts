/* eslint-disable max-classes-per-file */
import { FuncTree, FuncType, ValueType } from '../funcTree';
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
			type: GraphImporter.getFuncType(boxTree),
			value: boxTree.valueText,
			valueType: GraphImporter.getValueType(boxTree),
			params: boxTree.children.map((child) => GraphImporter.getFunc(child)),
		};
	}

	static getFuncType(boxTree: BoxTree): FuncType {
		let funcType: FuncType;
		if (boxTree.funcText[0] === '$') {
			funcType = FuncType.Constant;
		} else if (boxTree.funcText[0] === '=') {
			funcType = FuncType.MainExpression;
		} else if (boxTree.funcText[0] === '_') {
			funcType = FuncType.MainMininotation;
		} else if (boxTree.funcText[0] === '.') {
			funcType = FuncType.Chained;
		} else if (boxTree.funcText.slice(-1) === '^') {
			funcType = FuncType.Serialized;
		} else if (boxTree.children.length > 0) {
			funcType = FuncType.List;
		} else if (boxTree.funcText === '') {
			funcType = FuncType.Literal;
		} else {
			funcType = FuncType.Main;
		}
		return funcType;
	}

	static getValueType(boxTree: BoxTree): ValueType {
		let valueType: ValueType;
		if (boxTree.valueText === '') {
			valueType = ValueType.Empty;
		} else if (boxTree.valueText === '∅') {
			valueType = ValueType.Null;
		} else if (!Number.isNaN(boxTree.valueText)) {
			valueType = ValueType.Number;
		} else if (boxTree.valueText[0] === '_') {
			valueType = ValueType.Mininotation;
		} else if (boxTree.valueText[0] === '=') {
			valueType = ValueType.Expression;
		} else if (boxTree.children.length > 0) {
			valueType = ValueType.Tree;
		} else {
			valueType = ValueType.String;
		}
		return valueType;
	}
}
