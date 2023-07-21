import { VertexType } from './vertex';

export type Box = {
	boxName: string,
	boxType: VertexType,
	value: unknown,
	valueType: VertexType,
	children: Array<Box>,
};
