/* eslint-disable max-classes-per-file */
import { ExporterError } from '../errors';
import { FuncTree, FuncType, ValueType } from '../funcTree';

import AbstractExporter from './abstractExporter';

export type PartialBoxTree = {
	id: string,
	groupId: number,

	funcText: string,
	funcType: FuncType,
	valueText: string,
	valueType: ValueType,

	children: Array<PartialBoxTree>,
};

export type BoxTree = {
	id: string,
	groupId: number,

	funcText: string,
	funcType: FuncType,
	valueText: string,
	valueType: ValueType,

	contentWidth: number,
	padding: number,
	width: number,

	children: Array<BoxTree>,
};

export class GraphExporterError extends ExporterError {
	constructor(message: string) {
		super(message);
		this.name = GraphExporterError.name;
	}
}

export class GraphExporter extends AbstractExporter {
	static export(composition: FuncTree): BoxTree {
		const partialBoxTree = GraphExporter.upgradeTree(composition);
		return GraphExporter.computeBox(partialBoxTree);
	}

	static upgradeTree(func: FuncTree, funcId: Array<number> = [], groupId = 0): PartialBoxTree {
		let paramsGroupId = -1;

		const children = func.params.map((param, i) => {
			if (param.type !== FuncType.Chained) {
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
			funcText: GraphExporter.getFuncText(func),
			funcType: func.type,
			valueText: GraphExporter.getvalueText(func),
			valueType: func.valueType,
			children,
		};
	}

	static computeBox(pbt: PartialBoxTree, parent?: PartialBoxTree): BoxTree {
		const isNull = pbt.valueType === ValueType.Literal && pbt.valueText === '';
		const noSpace = pbt.funcType === FuncType.Literal || isNull;

		const contentWidth = pbt.funcText.length
			+ pbt.valueText.length + (noSpace ? 0 : 1);

		const group = parent?.children.filter(
			(child: PartialBoxTree) => child.groupId === pbt.groupId,
		);

		let padding: number;
		let width: number;

		if (group === undefined) {
			padding = pbt.funcText.length + 1;
			width = contentWidth;
		} else {
			const maxLength = Math.max(...group
				.filter((child: PartialBoxTree) => child.funcType !== FuncType.MainMininotation)
				.map((child: PartialBoxTree) => child.funcText.length));

			padding = maxLength + 1; // + (pbt.funcType === FuncType.Literal ? 0 : 1);

			const getDataWidth = (box: PartialBoxTree) => padding
				+ (isNull ? 2 : box.valueText.length);

			width = Math.max(...group.map((child: PartialBoxTree) => (
				child.funcType < FuncType.Main ? child.funcText.length : getDataWidth(child)
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

	static getFuncText(func: FuncTree): string {
		return func.name;
	}

	static getvalueText(func: FuncTree): string {
		if ([ValueType.Tree, ValueType.Empty].includes(func.valueType)) {
			return '';
		}
		if (func.type === FuncType.List) {
			return '[]';
		}
		if (func.value === null) {
			return '∅';
		}
		return `${func.value}`;
	}
}

export default GraphExporter;
