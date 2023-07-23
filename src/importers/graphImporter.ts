import { VBox, Box, BoxType, BoxValueType } from '../boxInterfaces';

export function getBoxType(vBox: VBox): BoxType {
	let funcType: BoxType;
	if (vBox.rawName[0] === '$') {
		funcType = BoxType.ConstantDef;
	} else if (vBox.rawName[0] === '.') {
		funcType = BoxType.ChainedFunc;
	} else if (vBox.rawName.slice(-1) === '^') {
		funcType = BoxType.SerializedData;
	// } else if (boxTree.children.length > 0) {
	// 	funcType = VertexType.List;
	} else if (vBox.rawName === '') {
		funcType = BoxType.Value;
	} else {
		funcType = BoxType.MainFunc;
	}
	return funcType;
}

export function vBoxToBox(graphBox: VBox): Box {
	return {
		rawName: graphBox.rawName,
		type: getBoxType(graphBox),
		rawValue: graphBox.rawValue,
		valueType: BoxValueType.String,
		children: graphBox.children.map((child) => vBoxToBox(child)),
	};
}

export default vBoxToBox;
