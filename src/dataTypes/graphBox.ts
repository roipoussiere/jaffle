import { BoxType, BoxValueType } from './box';

export type PartialGraphBox = {
	id: string,
	groupId: number,

	name: string,
	type: BoxType,
	valueText: string,
	valueType: BoxValueType,

	children: Array<PartialGraphBox>,
};

export type GraphBox = {
	id: string,
	groupId: number,

	name: string,
	type: BoxType,
	valueText: string,
	valueType: BoxValueType,

	contentWidth: number,
	padding: number,
	width: number,

	children: Array<GraphBox>,
};
