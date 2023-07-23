import { Box, Vertex, BoxType, BoxValueType } from '../boxInterfaces';
import * as c from '../constants';

export function boxToVertex(box: Box): Vertex {
	let vertex: Vertex;

	if (box.type === BoxType.Value) {
		if (box.valueType === BoxValueType.Mininotation) {
			vertex = {
				type: BoxType.MainFunc,
				value: c.MININOTATION_FUNC_NAME,
				children: [{
					type: BoxType.Value,
					value: box.rawValue,
					children: [],
				}],
			};
		} else if (box.valueType === BoxValueType.Expression) {
			vertex = {
				type: BoxType.MainFunc,
				value: c.EXPRESSION_FUNC_NAME,
				children: [{
					type: BoxType.Value,
					value: box.rawValue,
					children: [],
				}],
			};
		} else {
			vertex = {
				type: BoxType.Value,
				value: box.rawValue,
				children: [],
			};
		}
	} else if (box.children.length === 0) {
		vertex = {
			type: box.type,
			value: box.rawName,
			children: [{
				type: BoxType.Value,
				value: box.rawValue,
				children: [],
			}],
		};
	} else {
		vertex = {
			type: box.type,
			value: box.rawName,
			children: box.children.map((child) => boxToVertex(child)),
		};
	}
	return vertex;
}

export default boxToVertex;
