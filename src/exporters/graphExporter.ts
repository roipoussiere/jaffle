import { Vertex, VertexType } from '../dataTypes/vertex';

import AbstractExporter from './abstractExporter';
import { GraphExporterError } from './exporterErrors';

export type DraftBox = {
	funcName: string,
	funcType: VertexType,
	value: unknown,
	valueType: VertexType,
	children: Array<DraftBox>,
};

export type PartialBox = {
	id: string,
	groupId: number,

	funcName: string,
	funcType: VertexType,
	valueText: string,
	valueType: VertexType,
	isNumber: boolean,

	children: Array<PartialBox>,
};

export type Box = {
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

	children: Array<Box>,
};

class GraphExporter extends AbstractExporter {
	static export(composition: Vertex): Box {
		const arrangedTree = GraphExporter.arrangeTree(composition);
		const partialBoxTree = GraphExporter.upgradeTree(arrangedTree);
		return GraphExporter.computeBox(partialBoxTree);
	}

	static arrangeTree(vertex: Vertex): DraftBox {
		if (vertex.type === VertexType.Literal) {
			return {
				funcName: '',
				funcType: VertexType.Literal,
				value: vertex.value,
				valueType: VertexType.Literal,
				children: [],
			};
		}

		if (typeof vertex.value !== 'string') {
			throw new GraphExporterError(`Vertex value "${vertex.value}" must be a string`);
		}

		if (vertex.children.length === 1 && vertex.children[0].children.length === 0) {
			return {
				funcName: vertex.value,
				funcType: vertex.type,
				value: vertex.children[0].value,
				valueType: vertex.children[0].type,
				children: [],
			};
		}

		return {
			funcName: vertex.value,
			funcType: vertex.type,
			value: vertex.children[0].value,
			valueType: vertex.children[0].type,
			children: vertex.children.map((child) => GraphExporter.arrangeTree(child)),
		};
	}

	static upgradeTree(func: DraftBox, funcId: Array<number> = [], groupId = 0): PartialBox {
		let paramsGroupId = -1;

		const children = func.children.length <= 1 ? [] : func.children.map((param, i) => {
			if (param.funcType !== VertexType.ChainedFunc) {
				paramsGroupId += 1;
			}
			return GraphExporter.upgradeTree(
				param,
				funcId.concat(i),
				paramsGroupId,
			);
		});

		return {
			id: funcId.join('-'),
			groupId,
			funcName: GraphExporter.getFuncText(func),
			funcType: func.funcType,
			valueText: GraphExporter.getvalueText(func),
			valueType: func.valueType,
			isNumber: typeof func.value === 'number',
			children,
		};
	}

	static computeBox(pbt: PartialBox, parent?: PartialBox): Box {
		const isNull = pbt.valueType === VertexType.Literal && pbt.valueText === '';
		const noSpace = pbt.funcType === VertexType.Literal || isNull;

		const contentWidth = pbt.funcName.length
			+ pbt.valueText.length + (noSpace ? 0 : 1);

		const group = parent?.children.filter(
			(child: PartialBox) => child.groupId === pbt.groupId,
		);

		let padding: number;
		let width: number;

		if (group === undefined) {
			padding = pbt.funcName.length + 1;
			width = contentWidth;
		} else {
			const maxLength = Math.max(...group
				.filter((child: PartialBox) => child.funcType !== VertexType.Mininotation)
				.map((child: PartialBox) => child.funcName.length));

			padding = maxLength + 1; // + (pbt.funcType === FuncType.Literal ? 0 : 1);

			const getDataWidth = (box: PartialBox) => padding
				+ (isNull ? 2 : box.valueText.length);

			width = Math.max(...group.map((child: PartialBox) => (
				child.funcType < VertexType.MainFunc ? child.funcName.length : getDataWidth(child)
			)));
		}

		return {
			...pbt,
			contentWidth,
			padding,
			width,
			children: pbt.children.map((child) => GraphExporter.computeBox(child, pbt)),
		};
	}

	static getFuncText(func: DraftBox): string {
		return func.funcName;
	}

	static getvalueText(func: DraftBox): string {
		return func.value === null ? '' : `${func.value}`;
	}
}

export default GraphExporter;
