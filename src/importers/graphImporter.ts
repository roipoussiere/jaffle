import { Box, BoxType, BoxValueType } from '../dataTypes/box';
import { GraphBox } from '../dataTypes/graphBox';

export function getBoxType(graph: GraphBox): BoxType {
	let funcType: BoxType;
	if (graph.name[0] === '$') {
		funcType = BoxType.ConstantDef;
	} else if (graph.name[0] === '.') {
		funcType = BoxType.ChainedFunc;
	} else if (graph.name.slice(-1) === '^') {
		funcType = BoxType.SerializedData;
	// } else if (boxTree.children.length > 0) {
	// 	funcType = VertexType.List;
	} else if (graph.name === '') {
		funcType = BoxType.Value;
	} else {
		funcType = BoxType.MainFunc;
	}
	return funcType;
}

export function graphBoxToBox(graphBox: GraphBox): Box {
	return {
		name: graphBox.name,
		type: getBoxType(graphBox),
		value: graphBox.valueText,
		valueType: BoxValueType.String,
		children: graphBox.children.map((child) => graphBoxToBox(child)),
	};
}

export default graphBoxToBox;
