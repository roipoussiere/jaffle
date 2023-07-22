// eslint-disable-next-line max-classes-per-file
import { dump as dumpYaml } from 'js-yaml';

import { Box } from '../dataTypes/box';

export function boxToYaml(box: Box) {
	return dumpYaml(box);
}

export default boxToYaml;
