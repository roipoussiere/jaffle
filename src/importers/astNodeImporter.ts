import { AstNode, Entry, BoxType, ValueType } from '../model';
import * as c from '../constants';

// TODO
export function astNodeToEntry(astNode: AstNode): Entry {
	let vertex: Entry;

	if (astNode.type === BoxType.Value) {
		if (astNode.valueType === ValueType.Mininotation) {
			vertex = {
				type: BoxType.MainFunc,
				value: c.MININOTATION_FUNC_NAME,
				children: [{
					type: BoxType.Value,
					value: astNode.rawValue,
					children: [],
				}],
			};
		} else if (astNode.valueType === ValueType.Expression) {
			vertex = {
				type: BoxType.MainFunc,
				value: c.EXPRESSION_FUNC_NAME,
				children: [{
					type: BoxType.Value,
					value: astNode.rawValue,
					children: [],
				}],
			};
		} else {
			vertex = {
				type: BoxType.Value,
				value: astNode.rawValue,
				children: [],
			};
		}
	} else if (astNode.children.length === 0) {
		vertex = {
			type: astNode.type,
			value: astNode.rawName,
			children: [{
				type: BoxType.Value,
				value: astNode.rawValue,
				children: [],
			}],
		};
	} else {
		vertex = {
			type: astNode.type,
			value: astNode.rawName,
			children: astNode.children.map((child) => astNodeToEntry(child)),
		};
	}
	return vertex;
}

export default astNodeToEntry;
