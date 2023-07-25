import { Entry, AstNode, Box, BoxType } from './model';

export function entryToString(entry: Entry, indentLvl = 1): string {
	const keyVal = `'${entry.rawName}': '${entry.rawValue}'`.replace(/\n/g, ' ').substring(0, 50);
	const childrenStr = entry.children.map(
		(child) => `\n${'  '.repeat(indentLvl)}${entryToString(child, indentLvl + 1)}`,
	);

	return `${keyVal}${childrenStr.join('')}`;
}

export function astNodeToString(astNode: AstNode, indentLvl = 1): string {
	const keyVal = `'${astNode.value}' (${BoxType[astNode.type]})`
		.replace(/\n/g, ' ').substring(0, 50);
	const childrenStr = astNode.children.map(
		(child) => `\n${'  '.repeat(indentLvl)}${astNodeToString(child, indentLvl + 1)}`,
	);

	return `${keyVal}${childrenStr.join('')}`;
}

export function boxToString(box: Box, indentLvl = 1): string {
	const keyVal = `'${box.displayName}': '${box.displayValue}'`
		.replace(/\n/g, ' ').substring(0, 50);
	const childrenStr = box.children.map(
		(child) => `\n${'  '.repeat(indentLvl)}${boxToString(child, indentLvl + 1)}`,
	);

	return `${keyVal}${childrenStr.join('')}`;
}
