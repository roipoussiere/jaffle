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

		this.organize();
	}

	public draw(): void {
		const width = 800;
		const height = 400;
		const fontSize = 16;
		const boxWidth = 20;
		const boxGap = 3;

		const charWidth = fontSize * 0.6;
		const charHeight = fontSize * 1.5;
		const boxSpacing = boxWidth + boxGap;
		const root = d3.hierarchy(this.data, (d: any) => d.children); // TODO: add more logic

		const scaleX = (d: any) => (d.depth - 1) * boxSpacing * charWidth;
		const scaleY = (d: any) => d.data.y * charHeight;

		const svg = d3.create('svg')
			.attr('class', 'jaffle_graph')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height])
			.attr('style', `max-width: 100%; height: auto; font: ${fontSize}px mono;`);

		svg.append('g') // link
			.attr('fill', 'none')
			.attr('stroke', 'black')
			.attr('stroke-opacity', 0.5)
			.attr('stroke-width', 2)
			.selectAll()
			.data(root.links()
				.filter((d: any) => d.source.depth >= 1 && d.target.data.name[0] !== '.'))
			.join('path')
			.attr('d', d3.linkHorizontal().x(scaleX).y(scaleY));

		const node = svg.append('g')
			.selectAll()
			.data(root.descendants().filter((d: any) => d.depth >= 1))
			.join('g')
			.attr('transform', (d: any) => `translate(${scaleX(d)},${scaleY(d)})`);

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

	private organize(): void {
		// TODO: convert rawData to data
		this.data = tuneData;
	}
}

export default JaffleGraph;
