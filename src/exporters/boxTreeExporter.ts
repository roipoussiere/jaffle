import { Box, BoxType, BoxValueType } from '../dataTypes/box';
import { Vertex, VertexType } from '../dataTypes/vertex';

export default function vertexToBox(vertex: Vertex): Box {
	if (vertex.type === VertexType.Literal) {
		return {
			name: '',
			type: BoxType.Value,
			value: vertex.value,
			valueType: BoxValueType.String,
			children: [],
		};
	}
	return {
		name: `${vertex.value}`,
		type: BoxType.MainFunc,
		value: vertex.value,
		valueType: BoxValueType.String,
		children: vertex.children.map((child) => vertexToBox(child)),
	};
}
