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
		// based on https://observablehq.com/@d3/tree/2
		const width = 400;
		const root = d3.hierarchy(this.data);
		const dx = 10;
		const dy = width / (root.height + 1);
		const tree = d3.tree().nodeSize([dx, dy]);
		// console.log(root.links());

		root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
		tree(root);

		let x0 = Infinity;
		let x1 = -x0;
		root.each((d) => {
			if (d.x > x1) x1 = d.x;
			if (d.x < x0) x0 = d.x;
		});

		const height = x1 - x0 + dx * 2;

		const svg = d3.create('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [-dy / 3, x0 - dx, width, height])
			.attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

		svg.append('g') // link
			.attr('fill', 'none')
			.attr('stroke', 'black')
			.attr('stroke-opacity', 0.4)
			.attr('stroke-width', 1.5)
			.selectAll()
			.data(root.links())
			.join('path')
			.attr('d', d3.linkHorizontal().x((d) => d.y).y((d) => d.x));

		const node = svg.append('g')
			.attr('stroke-linejoin', 'round')
			.attr('stroke-width', 3)
			.selectAll()
			.data(root.descendants())
			.join('g')
			.attr('transform', (d) => `translate(${d.y},${d.x})`);

		node.append('circle')
			.attr('fill', (d) => (d.children ? '#555' : '#999'))
			.attr('r', 2.5);

		node.append('text')
			.attr('dy', '0.31em')
			.attr('x', (d) => (d.children ? -6 : 6))
			.attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
			.text((d) => `${d.data.name}: ${d.data.value ? d.data.value : ''}`)
			.clone(true)
			.lower()
			.attr('stroke', 'white');

		this.svg = <SVGElement>svg.node();
	}

	private organize(): void {
		// TODO: convert rawData to data
		this.data = tuneData;
	}
}

export default JaffleGraph;
