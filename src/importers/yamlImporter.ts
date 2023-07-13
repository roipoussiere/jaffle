import { NotImplementedError } from '../errors';
import { FuncTree } from '../funcTree';

import AbstractImporter from './abstractImporter';

class YamlImporter extends AbstractImporter {
	// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
	public import(yaml: string): FuncTree {
		throw new NotImplementedError('YamlImporter.import()');
	}
}

export default YamlImporter;
