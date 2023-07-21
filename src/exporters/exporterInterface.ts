import { Vertex } from '../dataTypes/vertex';

interface Exporter {
	export: (composition: Vertex) => unknown;
}

export default Exporter;
