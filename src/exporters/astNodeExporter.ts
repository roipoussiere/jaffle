import { AstFuncNode, AstNode, Entry, AstValue, Param, AstValueNode } from '../model';
import * as c from '../constants';
import { ExporterError } from '../errors';

export function entryToAstValueNode(entry: Entry): AstValueNode {
	let value: AstValue;

	if (entry.rawValue === '') {
		value = null;
	} else if (!Number.isNaN(Number(entry.rawValue))) {
		value = Number(entry.rawValue);
	} else if (entry.rawValue === 'true') {
		value = true;
	} else if (entry.rawValue === 'false') {
		value = false;
	} else {
		value = entry.rawValue;
	}

	return {
		value,
	};
}

export function entryToAstFuncNode(entry: Entry): AstFuncNode {
	const params: Array<Param> = [];
	entry.children.forEach((child) => {
		if (entry.rawName === '') {
			params.push(entryToAstValueNode(child));
		} else {
			const func = entryToAstFuncNode(child);
			if (child.rawName[0] === c.CHAINED_FUNC_PREFIX) {
				const funcChain = params[params.length - 1];
				if (!(funcChain instanceof Array)) {
					throw new ExporterError('chained function must follow a function');
				}
				funcChain.push(func);
			} else {
				params.push([func]);
			}
		}
	});

	return {
		name: entry.rawName,
		params,
	};
}

export function entryToAstNode(entry: Entry): AstNode {
	if (entry.rawName === '') {
		return entryToAstValueNode(entry);
	}
	return entryToAstFuncNode(entry);
}

export default entryToAstFuncNode;
