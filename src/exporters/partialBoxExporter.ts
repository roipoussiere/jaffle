import * as c from '../constants';
import { Entry, PartialBox } from '../model';

export function rawNameToDisplayName(rawName: string): string {
	return rawName; // TODO
}

export function rawValueToDisplayValue(rawValue: string): string {
	return `${rawValue}`; // TODO
}

export function
entryToPartialBox(entry: Entry, funcId: Array<number> = [], groupId = 0): PartialBox {
	let paramsGroupId = -1;

	return {
		rawName: entry.rawName,
		rawValue: entry.rawValue,

		id: funcId.join('-'),
		groupId,

		displayName: rawNameToDisplayName(entry.rawName),
		displayValue: rawValueToDisplayValue(entry.rawValue),

		// const children = box.children.length <= 1 ? [] : box.children.map((child, i) => {
		children: entry.children.map((child, i) => {
			if (child.rawName[0] === c.CHAINED_FUNC_PREFIX) {
				paramsGroupId += 1;
			}
			return entryToPartialBox(
				child,
				funcId.concat(i),
				paramsGroupId,
			);
		}),
	};
}

export default entryToPartialBox;
