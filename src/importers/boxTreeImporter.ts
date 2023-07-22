import { Box, BoxType, BoxValueType } from '../dataTypes/box';
import { Vertex, VertexType } from '../dataTypes/vertex';
import { BoxTreeImporterError } from './importerErrors';

export function boxTypeToVertexType(boxType: BoxType): VertexType {
	let vertexType: VertexType;
	if (boxType === BoxType.ChainedFunc) {
		vertexType = VertexType.ChainedFunc;
	} else if (boxType === BoxType.ConstantDef) {
		vertexType = VertexType.ConstantDef;
	} else if (boxType === BoxType.Expression) {
		vertexType = VertexType.Expression;
	} else if (boxType === BoxType.Literal) {
		vertexType = VertexType.Literal;
	} else if (boxType === BoxType.MainFunc) {
		vertexType = VertexType.MainFunc;
	} else if (boxType === BoxType.Mininotation) {
		vertexType = VertexType.Mininotation;
	} else if (boxType === BoxType.Object) {
		vertexType = VertexType.Object;
	} else if (boxType === BoxType.SerializedData) {
		vertexType = VertexType.SerializedData;
	} else {
		throw new BoxTreeImporterError(`can not convert BoxType ${boxType}`);
	}
	return vertexType;
}

export function boxToVertex(box: Box): Vertex {
	let vertex: Vertex;
	if (box.children.length === 0) {
		if (box.valueType === BoxValueType.Empty) {
			const child: Vertex = {
				type: VertexType.Literal,
				value: box.value,
				children: [],
			};
			vertex = {
				type: boxTypeToVertexType(box.type),
				value: box.value,
				children: [child],
			};
		} else {
			vertex = {
				type: boxTypeToVertexType(box.type),
				value: box.name,
				children: [{
					type: VertexType.Literal,
					value: box.value,
					children: [],
				}],
			};
		}
	} else if (box.children.length === 1) {
		vertex = {
			type: boxTypeToVertexType(box.type),
			value: null,
			children: box.children.map((child) => boxToVertex(child)),
		};
	} else {
		vertex = {
			type: boxTypeToVertexType(box.type),
			value: null,
			children: box.children.map((child) => boxToVertex(child)),
		};
	}
	return vertex;
}

export default boxToVertex;
