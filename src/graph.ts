/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';

import { load as loadYaml } from 'js-yaml';
import * as errors from './errors';

class JaffleGraph {
	public tuneYaml = '';

	public tune: any;

	public data: any;

	public container: HTMLElement;

	public svg: SVGElement;

	public init(container: HTMLElement): void {
		this.container = container;
	}

	public update(tuneYaml: string): void {
		this.tuneYaml = tuneYaml;
		this.loadYaml();
		this.svg?.remove();
		this.draw();
		this.container.appendChild(this.svg);
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

	public draw(): void {
		const width = 800;
		const height = 400;
		const fontSize = 14;
		const boxGap = 3;
		const boxMaxWidth = 20;

		const charWidth = fontSize * 0.6;
		const charHeight = fontSize * 1.4;

		const root = d3.hierarchy({ root: this.tune }, (d: any) => JaffleGraph.getChildren(d));

		let boxWidth = (Math.floor(width / charWidth) / root.height) - boxGap;
		boxWidth = boxWidth > boxMaxWidth ? boxMaxWidth : boxWidth;
		const boxSpacing = boxWidth + boxGap;

		const tree = d3.tree()
			.nodeSize([charHeight, boxSpacing * charWidth])
			.separation((a: any, b: any) => JaffleGraph.getNodesGap(a, b));

		tree(root);

		const svg = d3.create('svg')
			.attr('class', 'jaffle_graph')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [14 * charWidth, -10 * charHeight, width, height])
			.style('font', `${fontSize}px mono`);

		svg.append('g') // link
			.attr('fill', 'none')
			.attr('stroke', '#333')
			.attr('stroke-width', 2)
			.selectAll()
			.data(root.links().filter((d: any) => (
				d.source.depth >= 1 && JaffleGraph.getName(d.target.data)[0] !== '.'
			)))
			.join('path')
			.attr('d', (link: any) => d3.linkHorizontal()
				.x((d: any) => (d.y === link.source.y ? d.y + boxWidth * charWidth : d.y))
				.y((d: any) => d.x)(link));

		const node = svg.append('g')
			.selectAll()
			.data(root.descendants().filter((d: any) => d.depth >= 1))
			.join('g')
			.attr('transform', (d: any) => `translate(${d.y},${d.x})`);

		node.append('rect')
			.attr('width', boxWidth * charWidth)
			.attr('height', 1 * charHeight)
			.attr('y', -0.5 * charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('fill', '#ccc');

		node.append('text')
			.attr('y', 0.27 * charHeight)
			.text((d: any) => JaffleGraph.getNodeText(d.data));

		this.svg = <SVGElement>svg.node();
	}

	private static getNodesGap(nodeA: any, nodeB: any): number {
		const nameA = JaffleGraph.getName(nodeA.data);
		const nameB = JaffleGraph.getName(nodeB.data);

		const isStacked = (nameA[0] === '.' && nodeA.parent === nodeB.parent)
			|| (nameA === '' && nameB === '');
		return isStacked ? 1 : 2;
	}

	private static getNodeText(data: any): string {
		if (JaffleGraph.isDict(data)) {
			const funcName = Object.keys(data)[0];
			const funcParam = data[funcName];
			return (funcParam === null || JaffleGraph.isList(funcParam))
				? funcName
				: `${funcName}: ${funcParam}`;
		}
		return `${data}`;
	}

	private static isDict(data: any): boolean {
		return data instanceof Object && !(data instanceof Array);
	}

	private static isList(data: any): boolean {
		return data instanceof Array;
	}

	private static getName(data: any): string {
		return JaffleGraph.isDict(data) ? Object.keys(data)[0] : '';
	}

	private static getChildren(data: any): Array<any> {
		const name = JaffleGraph.getName(data);
		return (name !== '' && data[name] instanceof Array) ? data[name] : [];
	}
}

export default JaffleGraph;
