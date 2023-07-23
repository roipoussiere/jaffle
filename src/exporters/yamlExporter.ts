// eslint-disable-next-line max-classes-per-file
import { dump as dumpYaml } from 'js-yaml';

import { Entry } from '../model';

export function entryToYaml(entry: Entry): string {
	return dumpYaml(entry);
}

export default entryToYaml;
