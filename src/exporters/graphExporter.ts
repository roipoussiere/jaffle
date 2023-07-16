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

class Box {
	root: PartialBoxTree;

	func: PartialBoxTree;

	funcText: string;

	valueText: string;

	group: Array<PartialBoxTree>;

	contentWidth: number;

	padding: number;

	width: number;

	constructor(root: PartialBoxTree, func: PartialBoxTree) {
		this.root = root;
		this.func = func;
		this.group = this.getGroup();
		this.contentWidth = this.getContentWidth();
		this.padding = this.getPadding();
		this.width = this.getWidth();
	}

	private getGroup(): Array<PartialBoxTree> {
		return this.root.children.filter(
			(func: PartialBoxTree) => this.func.groupId === func.groupId,
		);
	}

	private getContentWidth(): number {
		const noSpace = this.func.funcType === FuncType.Literal
			|| this.func.valueType === ValueType.Null;
		return this.funcText.length
			+ this.valueText.length + (noSpace ? 0 : 1);
	}

	private getPadding(): number {
		if (this.group === undefined) {
			return this.contentWidth;
		}
		const maxLength = Math.max(...this.group
			.filter((child: PartialBoxTree) => child.funcType !== FuncType.MainMininotation)
			.map((child: PartialBoxTree) => child.funcText.length));

		return maxLength + (this.func.funcType === FuncType.Literal ? 0 : 1);
	}

	private getWidth(): number {
		if (this.group === undefined) {
			return this.padding;
		}
		const getDataWidth = (box: PartialBoxTree) => this.padding
			+ (box.valueType === ValueType.Null ? 2 : box.valueText.length);
		return Math.max(...this.group.map((child: PartialBoxTree) => (
			child.funcType < FuncType.Main ? child.funcText.length : getDataWidth(child)
		)));
	}
}

export class GraphExporter extends AbstractExporter {
	static export(composition: FuncTree): BoxTree {
		const partialBoxTree = GraphExporter.upgradeTree(composition);
		return GraphExporter.upgradeBox(partialBoxTree, partialBoxTree);
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
			...func,
			id: funcId.join('-'),
			groupId,
			funcText: GraphExporter.getFuncText(func),
			valueText: GraphExporter.getvalueText(func),
			funcType: func.type,
			valueType: func.valueType,
			children,
		};
	}

	static upgradeBox(root: PartialBoxTree, partialBox: PartialBoxTree): BoxTree {
		const box = new Box(root, partialBox);
		const children = partialBox.children.map((childBox) => this.upgradeBox(root, childBox));

		return {
			...partialBox,
			contentWidth: box.contentWidth,
			padding: box.padding,
			width: box.width,
			children,
		};
	}

	static getFuncText(func: FuncTree): string {
		return func.name;
	}

	static getvalueText(func: FuncTree): string {
		return `${func.value}`;
	}
}

export default GraphExporter;
