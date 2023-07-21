import { Vertex } from '../dataTypes/vertex';

interface Importer {
	import: (thing: unknown) => Vertex;
}

export default Importer;
