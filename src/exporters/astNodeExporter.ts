import { AstNode, BoxType, Entry, ValueType } from '../model';

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

export default function entryToAstNode(entry: Entry): AstNode {
	if (entry.type === BoxType.Value) {
		return {
			rawName: '',
			type: BoxType.Value,
			rawValue: `${entry.value}`,
			valueType: ValueType.String,
			children: [],
		};
	}

	return {
		rawName: `${entry.value}`, // TODO
		type: BoxType.MainFunc,
		rawValue: `${entry.value}`, // TODO
		valueType: ValueType.String,
		children: entry.children.map((child) => entryToAstNode(child)),
	};
}
