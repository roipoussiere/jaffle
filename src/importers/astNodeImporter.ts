import { AstNode, Entry, BoxType } from '../model';
import * as c from '../constants';

import { AstNodeImporterError } from './importerErrors';

export function getRawName(astNode: AstNode): string {
	let rawName: string;
	if (astNode.type === BoxType.Value) {
		rawName = '';
	} else if (astNode.type === BoxType.MainFunc) {
		rawName = `${astNode.value}`;
	} else if (astNode.type === BoxType.ChainedFunc) {
		rawName = `${c.CHAINED_FUNC_PREFIX}${astNode.value}`;
	} else if (astNode.type === BoxType.ConstantDef) {
		rawName = `${c.CONST_FUNC_PREFIX}${astNode.value}`;
	} else if (astNode.type === BoxType.SerializedData) {
		rawName = `${astNode.value}${c.SERIALIZE_FUNC_SUFFIX}`;
	} else {
		throw new AstNodeImporterError(`Unsupported ast node type: ${BoxType[astNode.type]}`);
	}
	return rawName;
}

export function astNodeToEntry(astNode: AstNode): Entry {
	return {
		rawName: getRawName(astNode),
		rawValue: `${astNode.value}`,
		children: astNode.children.map((child) => astNodeToEntry(child)),
	};
}

export default astNodeToEntry;
