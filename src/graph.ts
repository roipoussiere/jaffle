/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';

import { load as loadYaml } from 'js-yaml';
import * as errors from './errors';
import tuneData from './tune.json';

class JaffleGraph {
	public yaml = '';

	public rawData: any;

	public data: any;

	public svg: SVGElement;

	public load(inputYaml: string): void {
		this.yaml = inputYaml;
		let tune: any;
		try {
			tune = loadYaml(inputYaml);
		} catch (err) {
			throw new errors.BadYamlJaffleError(err.message);
		}
		this.rawData = tune;
	}

	public draw(): void {
		const width = 800;
		const height = 400;
		const fontSize = 14;
		const boxWidth = 20;
		const boxGap = 3;

		const charWidth = fontSize * 0.6;
		const charHeight = fontSize * 1.4;
		const boxSpacing = boxWidth + boxGap;

		// TODO: convert rawData to data
		const root = d3.hierarchy(tuneData, (d: any) => d.children);
		const tree = d3.tree()
			.nodeSize([charHeight, boxSpacing * charWidth])
			.separation((a: any) => (a.data.name[0] === '.' ? 1 : 2));

		tree(root);

		const svg = d3.create('svg')
			.attr('class', 'jaffle_graph')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [22 * charWidth, -7 * charHeight, width, height])
			.style('font', `${fontSize}px mono`);

		svg.append('g') // link
			.attr('fill', 'none')
			.attr('stroke', '#333')
			.attr('stroke-width', 2)
			.selectAll()
			.data(root.links()
				.filter((d: any) => d.source.depth >= 1 && d.target.data.name[0] !== '.'))
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
			.text((d: any) => `${d.data.name}: ${d.data.value || ''}`);

		this.svg = <SVGElement>svg.node();
	}
}

export default JaffleGraph;
