/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';

import { load as loadYaml } from 'js-yaml';
import * as errors from './errors';

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
		this.rootNode = d3.hierarchy({ root: this.tune }, (d: any) => JaffleGraph.getChildren(d));

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
				d.source.depth >= 1 && JaffleGraph.getFuncName(d.target.data)[0] !== '.'
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
			.style('fill', (d: any) => JaffleGraph.getFuncNameColor(d.data))
			.style('font-weight', (d: any) => (
				JaffleGraph.getFuncName(d.data)[0] === '.' ? 'normal' : 'bold'
			))
			.text((d: any) => JaffleGraph.getFuncName(d.data));

		const textParam = box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.attr('x', this.boxWidth * this.charWidth)
			.attr('text-anchor', 'end')
			.style('fill', (d: any) => JaffleGraph.getFuncParamColor(d.data))
			.style('font-weight', (d: any) => (
				JaffleGraph.getFuncName(d.data) === ''
					&& JaffleGraph.getFuncParam(d.data)[0] === '_'
					? 'bold' : 'normal'
			))
			.text((d: any) => {
				const name = JaffleGraph.getFuncName(d.data);
				const value = `${JaffleGraph.getFuncParam(d.data)}`;
				const textLength = name.length + value.length + 1;
				const truncateAt = this.boxWidth - (name.length > 0 ? name.length : -1) - 2;
				return textLength < this.boxWidth
					? value
					: `${value.substring(0, truncateAt)}…`;
			});

		textParam.append('title')
			.text((d: any) => JaffleGraph.getFuncParam(d.data));
	}

	private static getNodesGap(nodeA: any, nodeB: any): number {
		const nameA = JaffleGraph.getFuncName(nodeA.data);
		const nameB = JaffleGraph.getFuncName(nodeB.data);

		const isStacked = nodeA.parent === nodeB.parent
			&& (nameA[0] === '.' || (nameA === '' && nameB === ''));

		return isStacked ? 1 : 2;
	}

	private static getFuncName(data: any): string {
		return JaffleGraph.isDict(data) ? Object.keys(data)[0] : '';
	}

	private static getFuncParam(data: any): any {
		if (JaffleGraph.isDict(data)) {
			const funcParam = data[Object.keys(data)[0]];
			return funcParam === null || funcParam instanceof Object ? '' : funcParam;
		}
		return data;
	}

	private static getFuncParamColor(data: any): string {
		const param = JaffleGraph.getFuncParam(data);
		let color = 'gray';
		if (typeof param === 'string') {
			if (param[0] === '_') {
				color = 'green';
			} else if (param[0] === '=') {
				color = 'blue';
			} else {
				color = 'darkSlateGray';
			}
		}
		if (typeof param === 'number') {
			color = 'darkRed';
		}
		return color;
	}

	private static getFuncNameColor(data: any): string {
		const funcName = JaffleGraph.getFuncName(data);
		let color = 'black';
		if (funcName[0] === '$') {
			color = 'green';
		} else if (funcName[0] === '^') {
			color = 'blue';
		}
		return color;
	}

	private static isDict(data: any): boolean {
		return data instanceof Object && !(data instanceof Array);
	}

	private static getChildren(data: any): Array<any> {
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
