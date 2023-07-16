/* eslint-disable max-classes-per-file */
import { FuncTree, FuncType, ValueType } from '../funcTree';
import AbstractExporter from './abstractExporter';

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

class Box {
	func: FuncTree;

	funcText: string;

	valueText: string;

	group: Array<FuncTree>;

	contentWidth: number;

	padding: number;

	width: number;

	constructor(func: FuncTree) {
		this.func = func;
		this.funcText = this.getFuncText();
		this.valueText = this.getValueText();
		this.group = this.getGroup();
		this.contentWidth = this.getContentWidth();
		this.padding = this.getPadding();
		this.width = this.getWidth();
	}

	private getFuncText(): string {
		return this.func.name;
	}

	private getValueText(): string {
		return `${this.func.value}`;
	}

	private static getFuncTextOf(func: FuncTree): string {
		return func.name;
	}

	private static getValueTextOf(func: FuncTree): string {
		return `${func.value}`;
	}

	private getGroup(): Array<FuncTree> {
		return []; // TODO
	}

	private getContentWidth(): number {
		const noSpace = this.func.type === FuncType.Literal
			|| this.func.valueType === ValueType.Null;
		return this.funcText.length
			+ this.valueText.length + (noSpace ? 0 : 1);
	}

	private getPadding(): number {
		if (this.group === undefined) {
			return this.contentWidth;
		}
		const maxLength = Math.max(...this.group
			.filter((child: FuncTree) => child.type !== FuncType.MainMininotation)
			.map((child: FuncTree) => Box.getFuncTextOf(child).length));

		return maxLength + (this.func.type === FuncType.Literal ? 0 : 1);
	}

	private getWidth(): number {
		if (this.group === undefined) {
			return this.padding;
		}
		const getDataWidth = (n: FuncTree) => this.padding
			+ (n.valueType === ValueType.Null ? 2 : Box.getValueTextOf(n).length);
		return Math.max(...this.group.map((child: FuncTree) => (
			child.type < FuncType.Main ? Box.getFuncTextOf(child).length : getDataWidth(child)
		)));
	}
}

export class GraphExporter extends AbstractExporter {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
	static export(composition: FuncTree): BoxTree {
		return GraphExporter.upgradeTree(composition);
	}

	static upgradeTree(func: FuncTree, funcId: Array<number> = [], groupId = 0): BoxTree {
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

		const box = new Box(func);

		return {
			...func,
			id: funcId.join('-'),
			groupId,

			funcText: box.funcText,
			funcType: func.type,
			valueText: box.valueText,
			valueType: func.valueType,

			contentWidth: box.contentWidth,
			padding: box.padding,
			width: box.width,

			children,
		};
	}
}

export default GraphExporter;
