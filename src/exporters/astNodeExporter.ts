import { AstNode, BoxType, Entry, ValueType } from '../model';

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
