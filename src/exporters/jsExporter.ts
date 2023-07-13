import { FuncTree } from '../funcTree';
import { NotImplementedError } from '../errors';
import AbstractExporter from './abstractExporter';

class JsExporter extends AbstractExporter {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
	public export(composition: FuncTree): string {
		throw new NotImplementedError('JsExporter.export()');
	}
}

export default JsExporter;
