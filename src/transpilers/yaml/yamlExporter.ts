// eslint-disable-next-line max-classes-per-file
import { dump as dumpYaml } from 'js-yaml';

import { Dict, Entry } from '../../model';

export function entryToObject(entry: Entry): unknown {
	const value = entry.children.length === 0
		? entry.rawValue : entry.children.map((child) => entryToObject(child));

	return entry.rawName === '' ? value : { [entry.rawName]: value };
}

export function entryToYaml(entry: Entry): string {
	const object = entryToObject(entry) as Dict<unknown>;
	return dumpYaml(object.root);
}

export default entryToYaml;
