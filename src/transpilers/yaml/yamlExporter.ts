// eslint-disable-next-line max-classes-per-file
import { dump as dumpYaml } from 'js-yaml';

import * as c from '../../constants';
import { Dict, Entry } from '../../model';

export function entryToObject(entry: Entry): unknown {
	let value: unknown;

	if (entry.children.length === 0) {
		value = entry.rawValue;
	} else if (entry.children[0].rawName[0] === c.DICT_PREFIX) {
		value = {};
		entry.children.forEach((child) => {
			const newKey = child.rawName.split(c.DICT_PREFIX).reverse()[0];
			(value as Dict<unknown>)[newKey] = child.rawValue;
		});
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
