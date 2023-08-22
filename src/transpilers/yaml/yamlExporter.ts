// eslint-disable-next-line max-classes-per-file
import { dump as dumpYaml } from 'js-yaml';

import * as c from '../../constants';
import { Dict, Entry } from '../../model';
import { getEntryName } from '../utils';

export function stringToValue(str: string): unknown {
	if (str === '') {
		return null;
	}

	if (!Number.isNaN(Number(str))) {
		return Number(str);
	}

	if (str === 'true') {
		return true;
	}

	if (str === 'false') {
		return false;
	}

	return str;
}

export function dictEntryToDict(entry: Entry): Dict<unknown> {
	const dict: Dict<unknown> = {};
	entry.children.forEach((child) => {
		dict[getEntryName(child)] = child.children.length === 0
			? stringToValue(child.rawValue)
			: dictEntryToDict(child);
	});
	return dict;
}

export function entryToObject(entry: Entry): unknown {
	let value: unknown;

	if (entry.children.length === 0) {
		value = stringToValue(entry.rawValue);
	} else if (entry.children[0].rawName[0] === c.DICT_PREFIX) {
		value = dictEntryToDict(entry);
	} else {
		value = entry.children.map((child) => entryToObject(child));
	}

	return entry.rawName === '' ? value : { [entry.rawName]: value };
}

export function entryToYaml(entry: Entry): string {
	const object = entryToObject(entry) as Dict<unknown>;
	return dumpYaml(object.root);
}

export default entryToYaml;
