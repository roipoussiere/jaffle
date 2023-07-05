/* eslint-disable @typescript-eslint/no-explicit-any */

import { load as loadYaml } from 'js-yaml';
import * as errors from './errors';

class JaffleGraph {
	public yaml = '';

	public rawData: any;

	public data: any;

	public svg: SVGElement;

	public load(inputYaml: string): void {
		this.yaml = inputYaml;
		let tune: any;
		try {
			tune = loadYaml(inputYaml);
		} catch (err) {
			throw new errors.BadYamlJaffleError(err.message);
		}
		this.rawData = tune;
	}
}

export default JaffleGraph;
