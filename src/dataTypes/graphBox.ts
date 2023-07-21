import { VertexType } from './vertex';

export type PartialGraphBox = {
	id: string,
	groupId: number,

	funcName: string,
	funcType: VertexType,
	valueText: string,
	valueType: VertexType,
	isNumber: boolean,

	children: Array<PartialGraphBox>,
};

export type GraphBox = {
	id: string,
	groupId: number,

	funcName: string,
	funcType: VertexType,
	valueText: string,
	valueType: VertexType,
	isNumber: boolean,

	contentWidth: number,
	padding: number,
	width: number,

	children: Array<GraphBox>,
};
