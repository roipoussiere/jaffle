import { Box, Vertex, BoxType, BoxValueType } from '../boxInterfaces';

export default function vertexToBox(vertex: Vertex): Box {
	if (vertex.type === BoxType.Value) {
		return {
			rawName: '',
			type: BoxType.Value,
			rawValue: `${vertex.value}`,
			valueType: BoxValueType.String,
			children: [],
		};
	}

	return {
		rawName: `${vertex.value}`, // TODO
		type: BoxType.MainFunc,
		rawValue: `${vertex.value}`, // TODO
		valueType: BoxValueType.String,
		children: vertex.children.map((child) => vertexToBox(child)),
	};
}
