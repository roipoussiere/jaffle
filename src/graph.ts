import * as d3 from 'd3';
import { flextree } from 'd3-flextree';

import BoxHelper from './helpers/boxHelper';
import { BoxType, BoxValueType } from './dataTypes/box';
import { GraphBox } from './dataTypes/graphBox';

export type FuncNode = d3.id<GraphBox> & {
	x: number,
	y: number,
}

const BOX_NAME_COLORS = {
	[BoxType.MainFunc]: 'black',
	[BoxType.ConstantDef]: 'blue',
	[BoxType.SerializedData]: 'darkRed',
};

const BOX_VALUE_COLORS = {
	[BoxValueType.String]: 'darkSlateGray',
	[BoxValueType.Number]: 'darkRed',
	[BoxValueType.Boolean]: 'darkGreen',
	[BoxValueType.Mininotation]: 'green',
	[BoxValueType.Expression]: 'blue',
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

	public load(rawComposition: GraphBox): Graph {
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
			.data(this.tree.links().filter((d: d3.HierarchyLink<GraphBox>) => (
				d.source.depth >= 1 && d.target.data.type !== BoxType.ChainedFunc
			)))
			.join('path')
			.attr('d', (link: d3.HierarchyLink<GraphBox>) => d3.linkHorizontal()
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
			.style('font-weight', (n: FuncNode) => (n.data.type === BoxType.ChainedFunc
				? 'normal' : 'bold'))
			.text((d: FuncNode) => d.data.name);

		box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.attr('x', (d: FuncNode) => d.data.padding * this.charWidth)
			.style('fill', (d: FuncNode) => Graph.getValueColor(d.data))
			.text((d: FuncNode) => (
				d.data.valueType === BoxValueType.Null ? '∅' : d.data.valueText
			));

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
	// funcText: ${d.data.funcText}
	// funcType: ${FuncType[d.data.funcType]}
	// valueText: ${d.data.valueText}
	// valueType: ${ValueType[d.data.valueType]}
	// contentWidth: ${d.data.contentWidth}
	// padding: ${d.data.padding}
	// width: ${d.data.width}
	// `);
	}

	private drawInput(selectedBoxId: string, selectedBoxIsValue: boolean) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;

		const node = this.tree.find((n: FuncNode) => n.data.id === selectedBoxId);
		if (node === undefined) {
			return;
		}

		this.svg.append('foreignObject')
			.attr('x', selectedBoxIsValue ? node.y + node.data.padding * this.charWidth : node.y)
			.attr('y', node.x - 0.5 * this.charHeight)
			.attr('width', selectedBoxIsValue
				? (node.data.width - node.data.padding) * this.charWidth
				: node.data.padding * this.charWidth)
			.attr('height', this.charHeight)

			.append('xhtml:input')
			.attr('id', 'jaffle_ne_input')
			.attr('type', 'text')
			.attr('value', selectedBoxIsValue ? node.data.valueText : node.data.name)

			.on('input', (event: Event) => {
				const target = <HTMLInputElement>event.target;
				target.width = selectedBoxIsValue
					? (node.data.width - node.data.padding) * self.charWidth
					: node.data.padding * self.charWidth;
				const selected = self.tree.find((n: FuncNode) => n.data.id === selectedBoxId);
				if (selected !== undefined) {
					if (selectedBoxIsValue) {
						selected.data.valueText = target.value;
					} else {
						selected.data.name = target.value;
					}
				}
			})
			.on('change', () => {
				this.load(BoxHelper.fromGraph(this.tree.data).toGraph());
				this.draw();
			})
			.on('focusout', (event: Event) => {
				(<HTMLInputElement>event.target).parentElement?.remove();
			})

			.style('width', '100%')
			.style('padding', '0')
			.style('font-size', `${this.fontSize}px`)
			.style('font-family', 'monospace')
			.style('background-color', '#ccc')
			.style('color', selectedBoxIsValue
				? Graph.getValueColor(node.data) : BOX_NAME_COLORS[node.data.type])
			.style('font-weight', selectedBoxIsValue || node.data.type === BoxType.ChainedFunc
				? 'normal' : 'bold')
			.style('border', 'none')
			.style('border-radius', '3px');

		const domInput = <HTMLInputElement>document.getElementById('jaffle_ne_input');
		domInput.focus();
		domInput.selectionStart = 9999;
	}

	private static shouldStack(nodeA: FuncNode, nodeB: FuncNode): boolean {
		const bothAreLiteral = nodeA.data.type === BoxType.Value
			&& nodeB.data.type === BoxType.Value;
		return nodeA.parent === nodeB.parent
			&& (bothAreLiteral || nodeB.data.type === BoxType.ChainedFunc);
	}

	private static getValueColor(box: GraphBox) {
		return BOX_VALUE_COLORS[box.valueType];
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

	private static getLastFunc(node: FuncNode): FuncNode {
		const group = Graph.getGroup(node);
		return group[group.length - 1];
	}
}

export default Graph;
