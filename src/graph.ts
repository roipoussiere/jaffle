import * as d3 from 'd3';
import { flextree } from 'd3-flextree';

import { FuncTree, FuncType, ValueType } from './funcTree';

type FuncNode = d3.id<FuncTree> & {
	group: Array<FuncNode>,
	fist: FuncNode,
	last: FuncNode,

	contentWidth: number,
	boxPadding: number,
	boxWidth: number,

	x: number,
	y: number,
}

const BOX_NAME_COLORS = {
	[FuncType.Main]: 'black',
	[FuncType.MainMininotation]: 'green',
	[FuncType.MainExpression]: 'blue',
	[FuncType.Constant]: 'blue',
	[FuncType.Serialized]: 'darkRed',
};

const BOX_VALUE_COLORS = {
	[ValueType.String]: 'darkSlateGray',
	[ValueType.Mininotation]: 'green',
	[ValueType.Expression]: 'blue',
	[ValueType.Number]: 'darkRed',
};

class JaffleGraph {
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

	public init(container: HTMLElement): JaffleGraph {
		this.container = container;
		return this;
	}

	public load(composition: FuncTree): JaffleGraph {
		this.tree = <FuncNode> d3.hierarchy(composition, (data: FuncTree) => data.params);
		this.initTree();
		return this;
	}

	public initTree(): JaffleGraph {
		this.computeTree();
		const layout = flextree({})
			.nodeSize((n: FuncNode) => (
				[this.charHeight, (n.boxWidth + this.boxGap) * this.charWidth]
			))
			.spacing((a: FuncNode, b: FuncNode) => (
				JaffleGraph.shouldStack(a, b) ? 0 : 0.5 * this.charHeight
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
		this.offsetX = ((<FuncNode> this.tree).boxWidth + this.boxGap) * this.charWidth;
		this.offsetY = minNodeY - this.charHeight;

		return this;
	}

	private computeTree() {
		/* eslint-disable no-param-reassign */
		this.tree.each((node: FuncNode) => {
			node.group = JaffleGraph.getGroup(node);
			node.fist = JaffleGraph.getFirstFunc(node);
			node.last = JaffleGraph.getLastFunc(node);
			node.contentWidth = JaffleGraph.getBoxContentWidth(node);
			node.boxPadding = JaffleGraph.getBoxPadding(node);
			node.boxWidth = JaffleGraph.getBoxWidth(node);
		});
		/* eslint-enable no-param-reassign */
	}

	public draw(): JaffleGraph {
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
			.data(this.tree.links().filter((d: d3.HierarchyLink<FuncTree>) => (
				d.source.depth >= 1 && d.target.data.type !== FuncType.Chained
			)))
			.join('path')
			.attr('d', (link: d3.HierarchyLink<FuncTree>) => d3.linkHorizontal()
				.x((n: FuncNode) =>
					(n.y === link.source.y ? n.y + n.boxWidth * this.charWidth : n.y))
				.y((n: FuncNode) => n.x)(link));
	}

	private drawGroupArea() {
		this.svg.append('g')
			.selectAll()
			.data(this.tree.descendants().filter((n: FuncNode) => n.data.type !== FuncType.Chained))
			.join('rect')
			.attr('width', (node: FuncNode) => (node.boxWidth - 0.5) * this.charWidth)
			.attr('height', (node: FuncNode) => node.last.x - node.x)
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
			.attr('width', (n: FuncNode) => n.boxWidth * this.charWidth)
			.attr('height', 1 * this.charHeight)
			.attr('y', -0.5 * this.charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('fill', '#ccc');

		box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.style('fill', (n: FuncNode) => BOX_NAME_COLORS[n.data.type])
			.style('font-weight', (n: FuncNode) => (n.data.type === FuncType.Chained
				? 'normal' : 'bold'))
			.text((d: FuncNode) => d.data.label);

		box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.attr('x', (d: FuncNode) => d.boxPadding * this.charWidth)
			.style('fill', (d: FuncNode) => BOX_VALUE_COLORS[d.data.valueType])
			.text((d: FuncNode) => d.data.valueText);

		box.append('rect')
			.attr('width', (n: FuncNode) => n.boxPadding * this.charWidth)
			.attr('height', 1 * this.charHeight)
			.attr('y', -0.5 * this.charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('opacity', 0)
			.on('mouseover', (event) => onMouseOver(event.target))
			.on('mouseout', (event) => onMouseOut(event.target))
			.on('click', (event, node: FuncNode) => onClick(node, false));

		box.append('rect')
			.attr('width', (n: FuncNode) => (n.boxWidth - n.boxPadding) * this.charWidth)
			.attr('height', 1 * this.charHeight)
			.attr('x', (n: FuncNode) => n.boxPadding * this.charWidth)
			.attr('y', -0.5 * this.charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('opacity', 0)
			.on('mouseover', (event) => onMouseOver(event.target))
			.on('mouseout', (event) => onMouseOut(event.target))
			.on('click', (event, node: FuncNode) => onClick(node, true));

		// box.append('title')
		// 	.text((d: FuncNode) => d.data.id);
	}

	private drawInput(selectedBoxId: string, selectedBoxIsValue: boolean) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;

		const node = this.tree.find((n: FuncNode) => n.data.id === selectedBoxId);
		if (node === undefined) {
			return;
		}

		this.svg.append('foreignObject')
			.attr('x', selectedBoxIsValue ? node.y + node.boxPadding * this.charWidth : node.y)
			.attr('y', node.x - 0.5 * this.charHeight)
			.attr('width', selectedBoxIsValue
				? (node.boxWidth - node.boxPadding) * this.charWidth
				: node.boxPadding * this.charWidth)
			.attr('height', this.charHeight)

			.append('xhtml:input')
			.attr('id', 'jaffle_ne_input')
			.attr('type', 'text')
			.attr('value', selectedBoxIsValue ? node.data.valueText : node.data.label)

			.on('input', (event: Event) => {
				const target = <HTMLInputElement>event.target;
				target.width = selectedBoxIsValue
					? (node.boxWidth - node.boxPadding) * self.charWidth
					: node.boxPadding * self.charWidth;
				const selected = self.tree.find((n: FuncNode) => n.data.id === selectedBoxId);
				if (selected !== undefined) {
					// todo: change raw values instead
					if (selectedBoxIsValue) {
						selected.data.valueText = target.value;
					} else {
						selected.data.label = target.value;
					}
				}
			})
			.on('change', () => {
				self.initTree();
				self.draw();
			})
			.on('focusout', (event: Event) => {
				(<HTMLInputElement>event.target).parentElement?.remove();
			})

			.style('width', '100%')
			.style('padding', '0')
			.style('font-size', `${this.fontSize}px`)
			.style('font-family', 'monospace')
			.style('background-color', '#ccc')
			.style('color', BOX_NAME_COLORS[node.data.type])
			.style('font-weight', node.data.type === FuncType.Chained ? 'normal' : 'bold')
			.style('border', 'none')
			.style('border-radius', '3px');

		const domInput = <HTMLInputElement>document.getElementById('jaffle_ne_input');
		domInput.focus();
		domInput.selectionStart = 9999;
	}

	private static shouldStack(nodeA: FuncNode, nodeB: FuncNode): boolean {
		const bothAreLiteral = nodeA.data.type === FuncType.LiteralValue
			&& nodeB.data.type === FuncType.LiteralValue;
		return nodeA.parent === nodeB.parent
			&& (nodeB.data.type === FuncType.Chained || bothAreLiteral);
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
		return node.group[0];
	}

	private static getLastFunc(node: FuncNode): FuncNode {
		return node.group[node.group.length - 1];
	}

	private static getBoxContentWidth(node: FuncNode): number {
		const noSpace = node.data.type === FuncType.LiteralValue
			|| node.data.valueType === ValueType.Null;
		return node.data.label.length + node.data.valueText.length + (noSpace ? 0 : 1);
	}

	private static getBoxPadding(node: FuncNode): number {
		const group = JaffleGraph.getGroup(node);
		if (group === undefined) {
			return node.contentWidth;
		}
		const maxLength = Math.max(...group
			.filter((child: FuncNode) => child.data.type !== FuncType.MainMininotation)
			.map((child: FuncNode) => child.data.label.length));

		return maxLength + (node.data.type === FuncType.LiteralValue ? 0 : 1);
	}

	private static getBoxWidth(node: FuncNode): number {
		const group = JaffleGraph.getGroup(node);
		if (group === undefined) {
			return node.boxPadding;
		}
		const getDataWidth = (data: FuncTree) => node.boxPadding
			+ (data.valueType === ValueType.Null ? 2 : data.valueText.length);
		return Math.max(...group.map((child: FuncNode) => (
			child.data.type < FuncType.Main ? child.data.label.length : getDataWidth(child.data)
		)));
	}
}

export default JaffleGraph;
