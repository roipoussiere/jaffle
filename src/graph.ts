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
		// const height = 400;
		const fontSize = 14;
		const boxGap = 3;
		const boxMaxWidth = 20;

		const charWidth = fontSize * 0.6;
		const charHeight = fontSize * 1.4;

		const root = d3.hierarchy({ root: this.tune }, (d: any) => JaffleGraph.getChildren(d));

		const nbcWidth = Math.floor(width / charWidth);
		let boxWidth = ((nbcWidth + boxGap) / root.height) - boxGap;
		boxWidth = boxWidth > boxMaxWidth ? boxMaxWidth : boxWidth;

		const cellWidth = (boxWidth + boxGap) * charWidth;
		const cellHeight = charHeight;

		const tree = d3.tree()
			.nodeSize([cellHeight, cellWidth])
			.separation((a: any, b: any) => JaffleGraph.getNodesGap(a, b));

		tree(root);

		let x0 = Infinity;
		let x1 = -Infinity;
		root.each((d: any) => {
			x1 = d.x > x1 ? d.x : x1;
			x0 = d.x < x0 ? d.x : x0;
		});

		const height = x1 - x0 + cellHeight * 2;

		const svg = d3.create('svg')
			.attr('class', 'jaffle_graph')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [cellWidth, x0 - cellHeight, width, height])
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
			.style('fill', (d: any) => JaffleGraph.getFuncNameColor(d.data))
			.style('font-weight', (d: any) => (
				JaffleGraph.getFuncName(d.data)[0] === '.' ? 'normal' : 'bold'
			))
			.text((d: any) => JaffleGraph.getFuncName(d.data));

		node.append('text')
			.attr('y', 0.27 * charHeight)
			.attr('x', boxWidth * charWidth)
			.attr('text-anchor', 'end')
			.style('fill', (d: any) => JaffleGraph.getFuncParamColor(d.data))
			.text((d: any) => {
				const name = JaffleGraph.getFuncName(d.data);
				const value = `${JaffleGraph.getFuncParam(d.data)}`;
				const textLength = name.length + value.length + 1;
				return textLength < boxWidth
					? value
					: `${value.substring(0, boxWidth - (name.length > 0 ? name.length : -1) - 2)}…`;
			});

		this.svg = <SVGElement>svg.node();
	}

	private static getNodesGap(nodeA: any, nodeB: any): number {
		const nameA = JaffleGraph.getName(nodeA.data);
		const nameB = JaffleGraph.getName(nodeB.data);

		const isStacked = (nameA[0] === '.' && nodeA.parent === nodeB.parent)
			|| (nameA === '' && nameB === '');
		return isStacked ? 1 : 2;
	}

	private static getFuncName(data: any): string {
		return JaffleGraph.isDict(data) ? Object.keys(data)[0] : '';
	}

	private static getFuncParam(data: any): any {
		if (JaffleGraph.isDict(data)) {
			const funcName = Object.keys(data)[0];
			const funcParam = data[funcName];
			if (funcParam === null || JaffleGraph.isList(funcParam)) {
				return '';
			}
			return funcParam;
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
