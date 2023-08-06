// eslint-disable-next-line max-classes-per-file
import { dump as dumpYaml } from 'js-yaml';

import { Dict, Entry } from '../../model';

export function entryToObject(entry: Entry): Dict<unknown> {
	return {
		[entry.rawName]: entry.children.length === 0
			? entry.rawValue : entry.children.map((child) => entryToObject(child)),
	};
}

export function entryToYaml(entry: Entry): string {
	const object = entryToObject(entry);
	return dumpYaml(object.root);
}

export default entryToYaml;
