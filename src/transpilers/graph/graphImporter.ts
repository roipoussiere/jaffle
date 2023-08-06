import { Entry } from '../../model';

import { Box } from './graphModel';

export function boxToEntry(box: Box): Entry {
	return {
		rawName: box.rawName,
		rawValue: box.rawValue,
		children: box.children.map((child) => boxToEntry(child)),
	};
}

export default boxToEntry;
