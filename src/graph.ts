import * as d3 from 'd3';
import { flextree } from 'd3-flextree';

import entryToBox from './exporters/boxExporter';
import boxToEntry from './importers/boxImporter';

import { Box, BoxType, ValueType } from './model';

export type FuncNode = d3.id<Box> & {
	x: number,
	y: number,
}

const BOX_NAME_COLORS = {
	[BoxType.MainFunc]: 'black',
	[BoxType.ConstantDef]: 'blue',
	[BoxType.SerializedData]: 'darkRed',
};

const BOX_VALUE_COLORS = {
	[ValueType.String]: 'darkSlateGray',
	[ValueType.Number]: 'darkRed',
	[ValueType.Boolean]: 'darkGreen',
	[ValueType.Mininotation]: 'green',
	[ValueType.Expression]: 'blue',
};

class Graph {
	public container: HTMLElement;

	public domSvg: SVGElement;

	public width = 800;

	public height: number;

	public offsetX: number;

	public offsetY: number;

	public fontSize = 14;

	public boxGap = 3;

	public charWidth = this.fontSize * 0.6;

	public charHeight = this.fontSize * 1.4;

	private svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;

	private tree: FuncNode;

	public init(container: HTMLElement): Graph {
		this.container = container;
		return this;
	}

	public load(rawComposition: Box): Graph {
		this.tree = <FuncNode> d3.hierarchy(rawComposition);
		this.initTree();
		return this;
	}

	public initTree(): Graph {
		const layout = flextree({})
			.nodeSize((n: FuncNode) => (
				[this.charHeight, (n.data.width + this.boxGap) * this.charWidth]
			))
			.spacing((a: FuncNode, b: FuncNode) => (
				Graph.shouldStack(a, b) ? 0 : 0.5 * this.charHeight
			));

		layout(this.tree);

		let minNodeY = Infinity;
		let maxNodeY = -Infinity;
		this.tree.each((node: FuncNode) => {
			if (node.x > maxNodeY) {
				maxNodeY = node.x;
			}
			if (node.x < minNodeY) {
				minNodeY = node.x;
			}
		});

		this.height = maxNodeY - minNodeY + this.charHeight * 2;
		this.offsetX = ((<FuncNode> this.tree).data.width + this.boxGap) * this.charWidth;
		this.offsetY = minNodeY - this.charHeight;

		return this;
	}

	public draw(): Graph {
		this.drawSvg();
		this.domSvg?.remove();
		this.domSvg = <SVGElement> this.svg.node();
		this.container.appendChild(this.domSvg);
		return this;
	}

	private drawSvg() {
		this.svg = d3.create('svg')
			.attr('class', 'jaffle_graph')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('viewBox', [this.offsetX, this.offsetY, this.width, this.height])
			.style('font', `${this.fontSize}px mono`);

		this.drawLinks();
		this.drawGroupArea();
		this.drawBoxes();
	}

	private drawLinks() {
		this.svg.append('g')
			.attr('fill', 'none')
			.attr('stroke', '#333')
			.attr('stroke-width', 2)
			.selectAll()
			.data(this.tree.links().filter((d: d3.HierarchyLink<Box>) => (
				d.source.depth >= 1 && d.target.data.type !== BoxType.ChainedFunc
			)))
			.join('path')
			.attr('d', (link: d3.HierarchyLink<Box>) => d3.linkHorizontal()
				.x((n: FuncNode) => (
					n.y === link.source.y ? n.y + n.data.width * this.charWidth : n.y
				))
				.y((n: FuncNode) => n.x)(link));
	}

	private drawGroupArea() {
		this.svg.append('g')
			.selectAll()
			.data(this.tree.descendants()
				.filter((n: FuncNode) => n.data.type !== BoxType.ChainedFunc))
			.join('rect')
			.attr('width', (node: FuncNode) => (node.data.width - 0.5) * this.charWidth)
			.attr('height', (node: FuncNode) => Graph.getLastFunc(node).x - node.x)
			// .attr('height', (node: FuncNode) => this.getNodeById(node.lastSibling).x - node.x)
			.attr('x', (node: FuncNode) => node.y + 0.25 * this.charWidth)
			.attr('y', (node: FuncNode) => node.x)
			.attr('fill', '#ccc8');
	}

	private drawBoxes() {
		const onMouseOver = (target: HTMLElement) => {
			d3.select(<HTMLElement>target)
				.style('opacity', 0.2);
		};

		const onMouseOut = (target: HTMLElement) => {
			d3.select(<HTMLElement>target)
				.style('opacity', 0);
		};

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		const onClick = (node: FuncNode, isValue: boolean) => {
			self.drawInput(node.data.id, isValue);
		};

		const box = this.svg.append('g')
			.selectAll()
			.data(this.tree.descendants().filter((n: FuncNode) => n.depth >= 1))
			.join('g')
			.attr('transform', (n: FuncNode) => `translate(${n.y},${n.x})`);

		box.append('rect')
			.attr('width', (n: FuncNode) => n.data.width * this.charWidth)
			.attr('height', 1 * this.charHeight)
			.attr('y', -0.5 * this.charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('fill', '#ccc');

		box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.style('fill', (n: FuncNode) => BOX_NAME_COLORS[n.data.type])
			.style('font-weight', (n: FuncNode) => (n.data.type !== BoxType.ChainedFunc
				? 'bold' : 'normal'))
			.text((d: FuncNode) => d.data.displayName);

		box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.attr('x', (d: FuncNode) => d.data.padding * this.charWidth)
			.style('fill', (d: FuncNode) => BOX_VALUE_COLORS[d.data.valueType])
			.style('font-weight', (n: FuncNode) => (n.data.type === BoxType.Value
				&& (n.data.valueType === ValueType.Mininotation
				|| n.data.valueType === ValueType.Expression)
				? 'bold' : 'normal'))
			.text((d: FuncNode) => d.data.displayValue);

		box.append('rect')
			.attr('width', (n: FuncNode) => n.data.padding * this.charWidth)
			.attr('height', 1 * this.charHeight)
			.attr('y', -0.5 * this.charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('opacity', 0)
			.on('mouseover', (event) => onMouseOver(event.target))
			.on('mouseout', (event) => onMouseOut(event.target))
			.on('click', (event, node: FuncNode) => onClick(node, false));

		box.append('rect')
			.attr('width', (n: FuncNode) => (n.data.width - n.data.padding) * this.charWidth)
			.attr('height', 1 * this.charHeight)
			.attr('x', (n: FuncNode) => n.data.padding * this.charWidth)
			.attr('y', -0.5 * this.charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('opacity', 0)
			.on('mouseover', (event) => onMouseOver(event.target))
			.on('mouseout', (event) => onMouseOut(event.target))
			.on('click', (event, node: FuncNode) => onClick(node, true));

	// 		box.append('title')
	// 			.text((d: FuncNode) => `id: ${d.data.id}
	// groupId: ${d.data.groupId}
	// name:
	//   displayName: ${d.data.displayName}
	//   rawName: ${d.data.rawName}
	//   type: ${BoxType[d.data.type]}
	// value:
	//   displayValue: ${d.data.displayValue}
	//   rawValue: ${d.data.rawValue}
	//   valueType: ${ValueType[d.data.valueType]}
	// padding: ${d.data.padding}
	// width: ${d.data.width}`);
	}

	private drawInput(selectedBoxId: string, isValueSelected: boolean) {
		const focusedNode = this.getNodeById(selectedBoxId);
		if (focusedNode === undefined) {
			return;
		}

		this.svg.append('foreignObject')
			.attr('x', isValueSelected
				? focusedNode.y + focusedNode.data.padding * this.charWidth
				: focusedNode.y)
			.attr('y', focusedNode.x - 0.5 * this.charHeight)
			.attr('width', this.charWidth * (3 + (isValueSelected
				? (focusedNode.data.width - focusedNode.data.padding) : focusedNode.data.padding)))
			.attr('height', this.charHeight)

			.append('xhtml:input')
			.attr('id', 'jaffle_ne_input')
			.attr('type', 'text')
			.attr('value', isValueSelected ? focusedNode.data.rawValue : focusedNode.data.rawName)
			// .on('input', (event: Event) => {})

			.on('change', (event: Event) => {
				const rawText = (<HTMLInputElement>event.target).value;

				if (isValueSelected) {
					focusedNode.data.rawValue = rawText;
				} else {
					focusedNode.data.rawName = rawText;
				}

				this.load(entryToBox(boxToEntry(this.tree.data)));
				this.draw();
			})
			.on('focusout', (event: Event) => {
				const target = <HTMLInputElement>event.target;
				target.parentElement?.remove();
			})

			.style('width', '100%')
			.style('padding', '0')
			.style('font-size', `${this.fontSize}px`)
			.style('font-family', 'monospace')
			.style('background-color', '#aaa')
			.style('color', isValueSelected
				? BOX_VALUE_COLORS[focusedNode.data.valueType]
				: BOX_NAME_COLORS[focusedNode.data.type])
			.style('font-weight', isValueSelected || focusedNode.data.type === BoxType.ChainedFunc
				? 'normal' : 'bold')
			.style('border', 'none')
			.style('border-radius', '3px');

		const domInput = <HTMLInputElement>document.getElementById('jaffle_ne_input');
		domInput.focus();
		domInput.selectionStart = 9999;
	}

	getNodeById(id: string): FuncNode | undefined {
		return this.tree.find((n: FuncNode) => n.data.id === id);
	}

	private static shouldStack(nodeA: FuncNode, nodeB: FuncNode): boolean {
		const bothAreLiteral = nodeA.data.type === BoxType.Value
			&& nodeB.data.type === BoxType.Value;
		return nodeA.parent === nodeB.parent
			&& (bothAreLiteral || nodeB.data.type === BoxType.ChainedFunc);
	}

	private static getGroup(node: FuncNode): Array<FuncNode> {
		if (node.parent === null || node.parent.children === undefined) {
			return [node];
		}
		const group = node.parent.children
			.filter((child: FuncNode) => child.data.groupId === node.data.groupId);
		return group;
	}

	private static getFirstFunc(node: FuncNode): FuncNode {
		return Graph.getGroup(node)[0];
	}

	// TODO: remove in favor of this.getNodeById(node.lastSibling)
	private static getLastFunc(node: FuncNode): FuncNode {
		const group = Graph.getGroup(node);
		return group[group.length - 1];
	}
}

export default Graph;
