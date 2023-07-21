import { VertexType } from './vertex';

export type Box = {
	boxName: string,
	boxType: VertexType,
	value: unknown,
	valueType: VertexType,
	children: Array<Box>,
};

export interface Dict<T> {
	[key: string]: T;
}
