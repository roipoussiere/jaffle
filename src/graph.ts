/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import { flextree } from 'd3-flextree';

import { load as loadYaml } from 'js-yaml';
import * as errors from './errors';

import { FuncType, ValueType } from './composition';

type TreeNode = d3.HierarchyNode<any> & {
	boxId: number,
	x: number,
	y: number,
	boxName: string,
	boxValue: string,
	boxValueType: ValueType,
	boxNameType: FuncType,
	groupId: number,
	main: number,
	last: number,
	contentWidth: number,
	boxPadding: number,
	boxWidth: number,
}

const BOX_NAME_COLORS = {
	[FuncType.Main]: 'black',
	[FuncType.Mininotation]: 'green',
	[FuncType.Expression]: 'blue',
	[FuncType.Constant]: 'blue',
	[FuncType.Serialized]: 'darkRed',
};

const BOX_VALUE_COLORS = {
	[ValueType.String]: 'darkSlateGray',
	[ValueType.Mininotation]: 'green',
	[ValueType.Expression]: 'blue',
	[ValueType.Number]: 'darkRed',
};

class JaffleGraph {
	public container: HTMLElement;

	public domSvg: SVGElement;

	public selectedBoxId: number;

	public inputCursorPos = 0;

	public width = 800;

	public height: number;

	public fontSize = 14;

	public boxGap = 3;

	public charWidth = this.fontSize * 0.6;

	public charHeight = this.fontSize * 1.4;

	public minNodeY: number;

	public maxNodeY: number;

	private svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;

	private tree: d3.HierarchyNode<any>;

	public init(container: HTMLElement): JaffleGraph {
		this.container = container;
		return this;
	}

	public loadYaml(tuneYaml: string): JaffleGraph {
		let tune: any;
		try {
			tune = loadYaml(tuneYaml);
		} catch (err) {
			throw new errors.BadYamlJaffleError(err.message);
		}

		this.tree = d3.hierarchy(
			{ root: tune },
			(data: any) => JaffleGraph.getFuncParams(data),
		);

		return this;
	}

	public initTree(): JaffleGraph {
		this.computeTree();

		const layout = flextree()
			.nodeSize(
				(node: any) => [this.charHeight, (node.boxWidth + this.boxGap) * this.charWidth],
			)
			.spacing((a: any, b: any) => JaffleGraph.getNodesGap(a, b) * this.charHeight);

		layout(this.tree);

		this.minNodeY = Infinity;
		this.maxNodeY = -Infinity;
		this.tree.each((d: any) => {
			if (d.x > this.maxNodeY) {
				this.maxNodeY = d.x;
			}
			if (d.x < this.minNodeY) {
				this.minNodeY = d.x;
			}
		});

		this.height = this.maxNodeY - this.minNodeY + this.charHeight * 2;
		return this;
	}

	public draw(): JaffleGraph {
		this.drawSvg();
		this.domSvg?.remove();
		this.domSvg = <SVGElement> this.svg.node();
		this.container.appendChild(this.domSvg);
		const domInput = <HTMLInputElement>document.getElementById('jaffle_node_editor_input');
		if (domInput !== null) {
			domInput.focus();
			domInput.selectionStart = this.inputCursorPos === -1 ? 0 : this.inputCursorPos;
			domInput.selectionEnd = this.inputCursorPos === -1 ? 9999 : this.inputCursorPos;
		}
		return this;
	}

	private computeTree() {
		/* eslint-disable no-param-reassign */
		this.tree.each((d: any, id: number) => {
			d.boxId = id;
			d.boxName = JaffleGraph.getFuncName(d.data);
			d.boxValue = JaffleGraph.getFuncParam(d.data);
			d.boxValueType = JaffleGraph.getValueType(d);
			d.boxNameType = JaffleGraph.getFuncType(d);
			d.groupId = JaffleGraph.getGroupId(d);
			d.contentWidth = JaffleGraph.getContentWidth(d);
		});
		this.tree.each((d: any) => {
			d.main = JaffleGraph.getMain(d);
			d.last = JaffleGraph.getLast(d);
			d.boxPadding = JaffleGraph.getBoxPadding(d);
			d.boxWidth = JaffleGraph.getBoxWidth(d);
		});
		/* eslint-enable no-param-reassign */
	}

	private drawSvg() {
		this.svg = d3.create('svg')
			.attr('class', 'jaffle_graph')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('viewBox', [
				((<TreeNode> this.tree).boxWidth + this.boxGap) * this.charWidth,
				this.minNodeY - this.charHeight,
				this.width,
				this.height])
			.style('font', `${this.fontSize}px mono`);

		this.drawLinks();
		this.drawGroupArea();
		this.drawBoxes();
		this.drawInput();
	}

	private drawLinks() {
		this.svg.append('g')
			.attr('fill', 'none')
			.attr('stroke', '#333')
			.attr('stroke-width', 2)
			.selectAll()
			.data(this.tree.links().filter((d: any) => (
				d.source.depth >= 1 && d.target.boxNameType !== FuncType.Chained
			)))
			.join('path')
			.attr('d', (link: any) => d3.linkHorizontal()
				.x((d: any) => (d.y === link.source.y ? d.y + d.boxWidth * this.charWidth : d.y))
				.y((d: any) => d.x)(link));
	}

	private drawGroupArea() {
		this.svg.append('g')
			.selectAll()
			.data(this.tree.descendants()
				.filter((d: any) => [FuncType.Main, FuncType.Expression, FuncType.Mininotation]
					.includes(d.boxNameType)))
			.join('rect')
			.attr('width', (d: any) => (d.boxWidth - 0.5) * this.charWidth)
			.attr('height', (d: any) => d.last.x - d.x)
			.attr('x', (d: any) => d.y + 0.25 * this.charWidth)
			.attr('y', (d: any) => d.x)
			.attr('fill', '#ccc8');
	}

	private drawBoxes() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		const box = this.svg.append('g')
			.selectAll()
			.data(this.tree.descendants().filter((d: any) => d.depth >= 1))
			.join('g')
			.attr('transform', (d: any) => `translate(${d.y},${d.x})`)

			// eslint-disable-next-line func-names
			.on('mouseover', function () {
				d3.select(this)
					.select('rect')
					.style('stroke', 'black');
			})
			// eslint-disable-next-line func-names
			.on('mouseout', function () {
				d3.select(this)
					.select('rect')
					.style('stroke', 'none');
			})
			.on('click', (d, i) => {
				self.selectedBoxId = (<TreeNode>i).boxId;
				self.inputCursorPos = -1;
				self.draw();
			});

		box.append('rect')
			.attr('width', (d: any) => d.boxWidth * this.charWidth)
			.attr('height', 1 * this.charHeight)
			.attr('y', -0.5 * this.charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('fill', '#ccc');

		box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.style('fill', (d: any) => BOX_NAME_COLORS[d.boxNameType])
			.style('font-weight', (d: any) => (
				d.boxNameType === FuncType.Chained ? 'normal' : 'bold'
			))
			.text((d: any) => d.boxName);

		box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.attr('x', (d: any) => d.boxPadding * this.charWidth)
			.style('fill', (d: any) => BOX_VALUE_COLORS[d.boxValueType])
			.text((d: any) => (d.boxValue === null ? '' : `${d.boxValue}`));

		// textParam.append('title')
		// 	.text((d: any) => d.boxValue);
	}

	private drawInput() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		const d = <TreeNode> this.tree.find((node: any) => node.boxId === this.selectedBoxId);
		if (d === undefined) {
			return;
		}

		this.svg.append('foreignObject')
			.attr('y', d.x - 0.5 * this.charHeight)
			.attr('x', d.y)
			.attr('width', d.boxWidth * this.charWidth)
			.attr('height', this.charHeight)

			.append('xhtml:input')
			.attr('id', 'jaffle_node_editor_input')
			.attr('type', 'text')
			.attr('value', d.boxName)

			.on('input', (e) => {
				this.inputCursorPos = e.target.selectionStart;
				(<TreeNode> this.tree.find((node: any) => node.boxId === this.selectedBoxId))
					.boxName = e.target.value;
				this.initTree();
				self.draw();
			})

			.style('width', '100%')
			.style('padding', '0')
			.style('font-size', `${this.fontSize}px`)
			.style('font-family', 'monospace')
			.style('background-color', '#ccc')
			.style('color', BOX_NAME_COLORS[d.boxNameType])
			.style('font-weight', d.boxNameType === FuncType.Chained ? 'normal' : 'bold')
			.style('border', 'none')
			.style('border-radius', '3px');
	}

	private static getNodesGap(nodeA: TreeNode, nodeB: TreeNode): number {
		const bothAreNone = nodeA.boxNameType === FuncType.None
			&& nodeB.boxNameType === FuncType.None;
		const isStacked = nodeA.parent === nodeB.parent
			&& (nodeB.boxNameType === FuncType.Chained || bothAreNone);

		return isStacked ? 0 : 0.5;
	}

	private static getFuncType(node: TreeNode): FuncType {
		if (node.boxName === '') {
			return FuncType.None;
		}
		if (node.boxName[0] === '_') {
			return FuncType.Mininotation;
		}
		if (node.boxName[0] === '=') {
			return FuncType.Expression;
		}
		if (node.boxName[0] === '.') {
			return FuncType.Chained;
		}
		if (node.boxName[0] === '$') {
			return FuncType.Constant;
		}
		if (node.boxName.slice(-1) === '^') {
			return FuncType.Serialized;
		}
		return FuncType.Main;
	}

	private static getValueType(node: TreeNode): ValueType {
		if (node.boxValue === null) {
			return ValueType.None;
		}
		if (typeof node.boxValue === 'string') {
			if (node.boxValue[0] === '_') {
				return ValueType.Mininotation;
			}
			if (node.boxValue[0] === '=') {
				return ValueType.Expression;
			}
		}
		if (typeof node.boxValue === 'number') {
			return ValueType.Number;
		}
		return ValueType.String;
	}

	private static getContentWidth(node: TreeNode): number {
		const value = node.boxValue === null ? '' : `${node.boxValue}`;
		return node.boxName.length + value.length + (value === '' || node.boxName === '' ? 0 : 1);
	}

	private static getGroupId(node: TreeNode): number {
		let currentGroupId = 0;
		let groupId = -1;
		node.parent?.children?.forEach((child: TreeNode) => {
			if (groupId !== -1) {
				return;
			}
			if (child.boxNameType === FuncType.Constant
				|| child.parent?.boxNameType === FuncType.Serialized
				|| [FuncType.Main, FuncType.Mininotation, FuncType.Expression]
					.includes(child.boxNameType)) {
				currentGroupId += 1;
			}
			if (child.boxId === node.boxId) {
				groupId = currentGroupId;
			}
		});
		return groupId;
	}

	private static getGroup(node: TreeNode): Array<TreeNode> {
		if (node.parent === null || node.parent.children === undefined) {
			return [node];
		}
		const group = node.parent.children
			.filter((child: TreeNode) => child.groupId === node.groupId);
		return group;
	}

	private static getMain(node: TreeNode): TreeNode {
		return JaffleGraph.getGroup(node)[0];
	}

	private static getLast(node: TreeNode): TreeNode {
		const group = JaffleGraph.getGroup(node);
		return group[group.length - 1];
	}

	private static getBoxPadding(node: TreeNode): number {
		const group = JaffleGraph.getGroup(node);
		if (group === undefined) {
			return node.contentWidth;
		}
		return Math.max(...group
			.filter((child: any) => ![FuncType.Mininotation, FuncType.Expression]
				.includes(child.boxNameType))
			.map((child: any) => child.boxName.length))
			+ (node.boxNameType === FuncType.None ? 0 : 1);
	}

	private static getBoxWidth(node: TreeNode): number {
		const group = JaffleGraph.getGroup(node);
		if (group === undefined) {
			return node.boxPadding;
		}
		return Math.max(...group
			.map((child: any) => (
				[FuncType.Mininotation, FuncType.Expression].includes(child.boxNameType)
					? child.boxName.length
					: node.boxPadding + (child.boxValue === null ? -1 : `${child.boxValue}`.length)
			)));
	}

	private static isDict(data: any): boolean {
		return data instanceof Object && !(data instanceof Array);
	}

	private static isMainStr(data: any): boolean {
		return typeof data === 'string' && ['_', '='].includes(data[0]);
	}

	private static getFuncName(data: any): string {
		if (JaffleGraph.isDict(data)) {
			return Object.keys(data)[0];
		}
		return JaffleGraph.isMainStr(data) ? data : '';
	}

	private static getFuncParam(data: any): any {
		if (JaffleGraph.isDict(data)) {
			const funcParam = data[Object.keys(data)[0]];
			return funcParam === null || funcParam instanceof Object ? null : funcParam;
		}
		return JaffleGraph.isMainStr(data) ? '' : data;
	}

	private static getFuncParams(data: any): Array<any> {
		const name = JaffleGraph.getFuncName(data);
		if (name !== '') {
			if (data[name] instanceof Array) {
				return data[name];
			}
			if (data[name] instanceof Object) {
				return [data[name]];
			}
		}
		return [];
	}
}

export default JaffleGraph;
