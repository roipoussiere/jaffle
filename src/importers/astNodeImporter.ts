import { AstNode, Entry, BoxType, ValueType } from '../model';
import * as c from '../constants';

// function arrangeTree(vertex: Vertex): DraftBox {
// 	if (vertex.type === VertexType.Literal) {
// 		return {
// 			funcName: '',
// 			funcType: VertexType.Literal,
// 			value: vertex.value,
// 			valueType: VertexType.Literal,
// 			children: [],
// 		};
// 	}

// 	if (typeof vertex.value !== 'string') {
// 		throw new GraphExporterError(`Vertex value "${vertex.value}" must be a string`);
// 	}

// 	if (vertex.children.length === 1 && vertex.children[0].children.length === 0) {
// 		return {
// 			funcName: vertex.value,
// 			funcType: vertex.type,
// 			value: vertex.children[0].value,
// 			valueType: vertex.children[0].type,
// 			children: [],
// 		};
// 	}

// 	return {
// 		funcName: vertex.value,
// 		funcType: vertex.type,
// 		value: vertex.children[0].value,
// 		valueType: vertex.children[0].type,
// 		children: vertex.children.map((child) => arrangeTree(child)),
// 	};
// }

// TODO
export function astNodeToEntry(astNode: AstNode): Entry {
	let vertex: Entry;

	if (astNode.type === BoxType.Value) {
		if (astNode.valueType === ValueType.Mininotation) {
			vertex = {
				type: BoxType.MainFunc,
				value: c.MININOTATION_FUNC_NAME,
				children: [{
					type: BoxType.Value,
					value: astNode.rawValue,
					children: [],
				}],
			};
		} else if (astNode.valueType === ValueType.Expression) {
			vertex = {
				type: BoxType.MainFunc,
				value: c.EXPRESSION_FUNC_NAME,
				children: [{
					type: BoxType.Value,
					value: astNode.rawValue,
					children: [],
				}],
			};
		} else {
			vertex = {
				type: BoxType.Value,
				value: astNode.rawValue,
				children: [],
			};
		}
	} else if (astNode.children.length === 0) {
		vertex = {
			type: astNode.type,
			value: astNode.rawName,
			children: [{
				type: BoxType.Value,
				value: astNode.rawValue,
				children: [],
			}],
		};
	} else {
		vertex = {
			type: astNode.type,
			value: astNode.rawName,
			children: astNode.children.map((child) => astNodeToEntry(child)),
		};
	}
	return vertex;
}

export default astNodeToEntry;
