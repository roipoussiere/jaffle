import { Box, Entry, BoxType, ValueType } from '../model';

export function getBoxType(vBox: Box): BoxType {
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

export function boxToEntry(box: Box): Entry {
	return {
		rawName: box.rawName,
		type: getBoxType(box),
		rawValue: box.rawValue,
		valueType: ValueType.String,
		children: box.children.map((child) => boxToEntry(child)),
	};
}

export default boxToEntry;
