import { Vertex, VertexType } from '../dataTypes/vertex';
import { Box } from '../exporters/graphExporter';

import AbstractImporter from './abstractImporter';

class GraphImporter extends AbstractImporter {
	static import(graph: Box): Vertex {
		return GraphImporter.getFunc(graph);
	}

	static getFunc(boxTree: Box): Vertex {
		return {
			type: GraphImporter.getFuncType(boxTree),
			value: boxTree.valueText,
			// valueType: GraphImporter.getValueType(boxTree),
			children: boxTree.children.map((child) => GraphImporter.getFunc(child)),
		};
	}

	static getFuncType(boxTree: Box): VertexType {
		let funcType: VertexType;
		if (boxTree.funcName[0] === '$') {
			funcType = VertexType.ConstantDef;
		} else if (boxTree.funcName[0] === '=') {
			funcType = VertexType.Expression;
		} else if (boxTree.funcName[0] === '_') {
			funcType = VertexType.Mininotation;
		} else if (boxTree.funcName[0] === '.') {
			funcType = VertexType.ChainedFunc;
		} else if (boxTree.funcName.slice(-1) === '^') {
			funcType = VertexType.SerializedData;
		// } else if (boxTree.children.length > 0) {
		// 	funcType = VertexType.List;
		} else if (boxTree.funcName === '') {
			funcType = VertexType.Literal;
		} else {
			funcType = VertexType.MainFunc;
		}
		return funcType;
	}

	static getValueType(boxTree: Box): VertexType {
		let valueType: VertexType;
		// if (boxTree.valueText === '') {
		// 	valueType = VertexType.Empty;
		if (boxTree.valueText[0] === '_') {
			valueType = VertexType.Mininotation;
		} else if (boxTree.valueText[0] === '=') {
			valueType = VertexType.Expression;
		// } else if (boxTree.children.length > 0) {
		// 	valueType = VertexType.Tree;
		} else {
			valueType = VertexType.Literal;
		}
		return valueType;
	}
}

export default GraphImporter;
