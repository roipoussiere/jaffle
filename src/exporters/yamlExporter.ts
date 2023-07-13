import { NotImplementedError } from '../errors';
import { FuncTree } from '../funcTree';

import AbstractExporter from './abstractExporter';

class YamlExporter extends AbstractExporter {
	// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
	public export(composition: FuncTree): string {
		throw new NotImplementedError('YamlExporter.export()');
	}
}

export default YamlExporter;
