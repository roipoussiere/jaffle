/* eslint-disable import/prefer-default-export */
import { Box } from './graphModel';

export function boxToString(box: Box, indentLvl = 1): string {
	const keyVal = `'${box.displayName}': '${box.displayValue}'`
		.replace(/\n/g, ' ').substring(0, 50);
	const childrenStr = box.children.map(
		(child) => `\n${'  '.repeat(indentLvl)}${boxToString(child, indentLvl + 1)}`,
	);

	return `${keyVal}${childrenStr.join('')}`;
}
