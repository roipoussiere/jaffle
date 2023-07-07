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
		const boxWidth = 8;
		const boxSpacing = 10;
		const root = d3.hierarchy(this.data, (d: any) => d.children); // TODO: add more logic

		const svg = d3.create('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, 40, 20])
			.attr('style', 'max-width: 100%; height: auto; font: 0.8px mono;');

		svg.append('g') // link
			.attr('fill', 'none')
			.attr('stroke', 'black')
			.attr('stroke-opacity', 0.5)
			.attr('stroke-width', 0.1)
			.selectAll()
			.data(root.links()
				.filter((d: any) => d.source.depth >= 1 && d.target.data.name[0] !== '.'))
			.join('path')
			.attr('d', d3.linkHorizontal()
				.x((d: any) => (d.depth - 1) * boxSpacing)
				.y((d: any) => d.data.y));
		// .attr('transform', (d: any) => `scale(${0.5})`);

		const node = svg.append('g')
			.attr('stroke-linejoin', 'round')
			.attr('stroke-width', 0.2)
			.selectAll()
			.data(root.descendants().filter((d: any) => d.depth >= 1))
			.join('g')
			.attr('transform', (d: any) => `translate(${(d.depth - 1) * boxSpacing},${d.data.y})`);

		node.append('rect')
			.attr('width', boxWidth)
			.attr('height', 1)
			.attr('y', -0.5)
			.attr('rx', 0.2)
			.attr('ry', 0.2)
			.attr('fill', '#ccc');

		node.append('text')
			.attr('y', 0.3)
			.text((d: any) => `${d.data.name}: ${d.data.value || ''}`);

		this.svg = <SVGElement>svg.node();
	}

	private organize(): void {
		// TODO: convert rawData to data
		this.data = tuneData;
	}
}

export default JaffleGraph;
