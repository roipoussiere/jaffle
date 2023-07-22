import { Box, BoxType, BoxValueType } from '../dataTypes/box';
import { Vertex, VertexType } from '../dataTypes/vertex';
import * as c from '../constants';

import { BoxTreeImporterError } from './importerErrors';

export function boxTypeToVertexType(boxType: BoxType): VertexType {
	const typeConverter: {[key: number]: VertexType} = {
		[BoxType.ChainedFunc]: VertexType.ChainedFunc,
		[BoxType.ConstantDef]: VertexType.ConstantDef,
		[BoxType.Value]: VertexType.Literal,
		[BoxType.MainFunc]: VertexType.MainFunc,
		[BoxType.Object]: VertexType.Object,
		[BoxType.SerializedData]: VertexType.SerializedData,
	};

	if (boxType in typeConverter) {
		return typeConverter[boxType];
	}
	throw new BoxTreeImporterError(`can not convert BoxType ${BoxType[boxType]}`);
}

export function boxToVertex(box: Box): Vertex {
	let vertex: Vertex;

	if (box.type === BoxType.Value) {
		if (box.valueType === BoxValueType.Mininotation) {
			vertex = {
				type: VertexType.MainFunc,
				value: c.MININOTATION_FUNC_NAME,
				children: [{
					type: VertexType.Literal,
					value: box.value,
					children: [],
				}],
			};
		} else if (box.valueType === BoxValueType.Expression) {
			vertex = {
				type: VertexType.MainFunc,
				value: c.EXPRESSION_FUNC_NAME,
				children: [{
					type: VertexType.Literal,
					value: box.value,
					children: [],
				}],
			};
		} else {
			vertex = {
				type: VertexType.Literal,
				value: box.value,
				children: [],
			};
		}
	} else if (box.children.length === 0) {
		vertex = {
			type: boxTypeToVertexType(box.type),
			value: box.name,
			children: [{
				type: VertexType.Literal,
				value: box.value,
				children: [],
			}],
		};
	} else {
		vertex = {
			type: boxTypeToVertexType(box.type),
			value: box.name,
			children: box.children.map((child) => boxToVertex(child)),
		};
	}
	return vertex;
}

export default boxToVertex;
