/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';

import { load as loadYaml } from 'js-yaml';
import * as errors from './errors';

enum BoxNameType {
	None,
	Main,
	MainMini,
	Chained,
	Constant,
	Serialized
}

enum BoxValueType {
	None,
	StringMininotation,
	StringExpression,
	StringClassic,
	Number,
	Other
}

type TreeNode = d3.HierarchyNode<any> & {
	boxName: string,
	boxValue: string,
	boxNameType: BoxNameType,
	boxValueType: BoxValueType,
}

const BOX_NAME_COLORS = {
	[BoxNameType.Main]: 'black',
	[BoxNameType.Constant]: 'green',
	[BoxNameType.Serialized]: 'blue',
};

const BOX_VALUE_COLORS = {
	[BoxValueType.StringClassic]: 'darkSlateGray',
	[BoxValueType.StringMininotation]: 'green',
	[BoxValueType.StringExpression]: 'blue',
	[BoxValueType.Number]: 'darkRed',
	[BoxValueType.Other]: 'red',
};

class JaffleGraph {
	public tuneYaml = '';

	public tune: any;

	public data: any;

	public container: HTMLElement;

	public domSvg: SVGElement;

	public width = 800;

	public height: number;

	public fontSize = 14;

	public boxGap = 3;

	public boxMaxWidth = 20;

	public charWidth = this.fontSize * 0.6;

	public charHeight = this.fontSize * 1.4;

	public boxWidth: number;

	public boxStepX: number;

	public boxStepY: number;

	public minNodeY: number;

	public maxNodeY: number;

	private svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;

	private rootNode: d3.HierarchyNode<any>;

	public init(container: HTMLElement): void {
		this.container = container;
	}

	public update(tuneYaml: string): void {
		this.tuneYaml = tuneYaml;
		this.loadYaml();

		this.domSvg?.remove();
		this.initTree();
		this.drawSvg();
		this.domSvg = <SVGElement> this.svg.node();

		this.container.appendChild(this.domSvg);
	}

	public loadYaml(): void {
		let tune: any;
		try {
			tune = loadYaml(this.tuneYaml);
		} catch (err) {
			throw new errors.BadYamlJaffleError(err.message);
		}
		this.tune = tune;
	}

	private initTree(): void {
		this.rootNode = d3.hierarchy(
			{ root: this.tune },
			(data: any) => JaffleGraph.getFuncParams(data),
		);
		this.computeTree();

		const nbcWidth = Math.floor(this.width / this.charWidth);
		this.boxWidth = ((nbcWidth + this.boxGap) / this.rootNode.height) - this.boxGap;
		this.boxWidth = this.boxWidth > this.boxMaxWidth ? this.boxMaxWidth : this.boxWidth;

		this.boxStepX = (this.boxWidth + this.boxGap) * this.charWidth;
		this.boxStepY = this.charHeight;

		const tree = d3.tree()
			.nodeSize([this.boxStepY, this.boxStepX])
			.separation((a: any, b: any) => JaffleGraph.getNodesGap(a, b));

		tree(this.rootNode);

		this.minNodeY = Infinity;
		this.maxNodeY = -Infinity;
		this.rootNode.each((d: any) => {
			if (d.x > this.maxNodeY) {
				this.maxNodeY = d.x;
			}
			if (d.x < this.minNodeY) {
				this.minNodeY = d.x;
			}
		});

		this.height = this.maxNodeY - this.minNodeY + this.boxStepY * 2;
	}

	private computeTree() {
		this.rootNode.each((d: any) => {
			/* eslint-disable no-param-reassign */
			d.boxName = JaffleGraph.getFuncName(d.data);
			d.boxValue = JaffleGraph.getFuncParam(d.data);
			d.boxValueType = JaffleGraph.getBoxValueType(d);
			d.boxNameType = JaffleGraph.getBoxNameType(d);
			/* eslint-enable no-param-reassign */
		});
	}

	private drawSvg() {
		this.svg = d3.create('svg')
			.attr('class', 'jaffle_graph')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('viewBox', [
				this.boxStepX, this.minNodeY - this.boxStepY,
				this.width, this.height])
			.style('font', `${this.fontSize}px mono`);

		this.drawLinks();
		this.drawBoxes();
	}

	private drawLinks() {
		this.svg.append('g')
			.attr('fill', 'none')
			.attr('stroke', '#333')
			.attr('stroke-width', 2)
			.selectAll()
			.data(this.rootNode.links().filter((d: any) => (
				d.source.depth >= 1 && d.target.boxNameType !== BoxNameType.Chained
			)))
			.join('path')
			.attr('d', (link: any) => d3.linkHorizontal()
				.x((d: any) => (d.y === link.source.y ? d.y + this.boxWidth * this.charWidth : d.y))
				.y((d: any) => d.x)(link));
	}

	private drawBoxes() {
		const box = this.svg.append('g')
			.selectAll()
			.data(this.rootNode.descendants().filter((d: any) => d.depth >= 1))
			.join('g')
			.attr('transform', (d: any) => `translate(${d.y},${d.x})`);

		box.append('rect')
			.attr('width', this.boxWidth * this.charWidth)
			.attr('height', 1 * this.charHeight)
			.attr('y', -0.5 * this.charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('fill', '#ccc');

		box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.style('fill', (d: any) => BOX_NAME_COLORS[d.boxNameType])
			.style('font-weight', (d: any) => (
				d.boxNameType === BoxNameType.Chained ? 'normal' : 'bold'
			))
			.text((d: any) => d.boxName);

		const textParam = box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.attr('x', (d: any) => (
				d.boxNameType === BoxNameType.MainMini ? 0 : this.boxWidth * this.charWidth
			))
			.attr('text-anchor', (d: any) => (
				d.boxNameType === BoxNameType.MainMini ? 'start' : 'end'
			))
			.style('fill', (d: any) => BOX_VALUE_COLORS[d.boxValueType])
			.style('font-weight', (d: any) => (
				d.boxNameType === BoxNameType.MainMini ? 'bold' : 'normal'
			))
			.text((d: any) => this.getBoxDisplayedValue(d));

		textParam.append('title')
			.text((d: any) => d.boxValue);
	}

	private getBoxDisplayedValue(node: TreeNode): string {
		const value = node.boxValue === null ? '' : `${node.boxValue}`;
		const textLength = node.boxName.length + value.length + 1;
		const cutAt = this.boxWidth - (node.boxName.length > 0 ? node.boxName.length : -1) - 2;
		return textLength < this.boxWidth ? value : `${value.substring(0, cutAt)}…`;
	}

	private static getNodesGap(nodeA: TreeNode, nodeB: TreeNode): number {
		const bothAreNone = nodeA.boxNameType === BoxNameType.None
			&& nodeB.boxNameType === BoxNameType.None;
		const isStacked = nodeA.parent === nodeB.parent
			&& (nodeA.boxNameType === BoxNameType.Chained || bothAreNone);

		return isStacked ? 1 : 2;
	}

	private static getBoxNameType(node: TreeNode): BoxNameType {
		if (node.boxName === '') {
			if (node.boxValueType === BoxValueType.StringMininotation) {
				return BoxNameType.MainMini;
			}
			return BoxNameType.None;
		}
		if (node.boxName[0] === '.') {
			return BoxNameType.Chained;
		}
		if (node.boxName[0] === '$') {
			return BoxNameType.Constant;
		}
		if (node.boxName[0] === '^') {
			return BoxNameType.Serialized;
		}
		return BoxNameType.Main;
	}

	private static getBoxValueType(node: TreeNode): BoxValueType {
		if (node.boxValue === null) {
			return BoxValueType.None;
		}
		if (typeof node.boxValue === 'string') {
			if (node.boxValue[0] === '_') {
				return BoxValueType.StringMininotation;
			}
			if (node.boxValue[0] === '=') {
				return BoxValueType.StringExpression;
			}
			return BoxValueType.StringClassic;
		}
		if (typeof node.boxValue === 'number') {
			return BoxValueType.Number;
		}
		return BoxValueType.Other;
	}

	private static isDict(data: any): boolean {
		return data instanceof Object && !(data instanceof Array);
	}

	private static getFuncName(data: any): string {
		return JaffleGraph.isDict(data) ? Object.keys(data)[0] : '';
	}

	private static getFuncParam(data: any): any {
		if (JaffleGraph.isDict(data)) {
			const funcParam = data[Object.keys(data)[0]];
			return funcParam === null || funcParam instanceof Object ? null : funcParam;
		}
		return data;
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
