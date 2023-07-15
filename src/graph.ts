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

	public selectedBoxId: string;

	public selectedBoxIsValue: boolean;

	public inputCursorPos = 0;

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
		const domInput = <HTMLInputElement>document.getElementById('jaffle_ne_input');
		if (domInput !== null) {
			domInput.focus();
			domInput.selectionStart = this.inputCursorPos === -1 ? 0 : this.inputCursorPos;
			domInput.selectionEnd = this.inputCursorPos === -1 ? 9999 : this.inputCursorPos;
		}
		return this;
	}

	private drawSvg() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;

		this.svg = d3.create('svg')
			.attr('class', 'jaffle_graph')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('viewBox', [this.offsetX, this.offsetY, this.width, this.height])
			.style('font', `${this.fontSize}px mono`);

		this.svg.append('rect')
			.attr('x', this.offsetX)
			.attr('y', this.offsetY)
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('opacity', 0)
			.on('click', () => {
				self.selectedBoxId = '';
				self.draw();
			});

		this.drawLinks();
		this.drawGroupArea();
		this.drawBoxes();
		this.drawInput();
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
		const mainFuncs = [FuncType.Main, FuncType.MainExpression, FuncType.MainMininotation];
		this.svg.append('g')
			.selectAll()
			.data(this.tree.descendants().filter((n: FuncNode) => mainFuncs.includes(n.data.type)))
			.join('rect')
			.attr('width', (node: FuncNode) => (node.boxWidth - 0.5) * this.charWidth)
			.attr('height', (node: FuncNode) => node.last.x - node.x)
			.attr('x', (node: FuncNode) => node.y + 0.25 * this.charWidth)
			.attr('y', (node: FuncNode) => node.x)
			.attr('fill', '#ccc8');
	}

	private drawBoxes() {
		const onMouseOver = (target: HTMLElement) => {
			d3.select(<HTMLElement>target.parentElement?.firstChild)
				.style('stroke', 'black');
		};

		const onMouseOut = (target: HTMLElement) => {
			d3.select(<HTMLElement>target.parentElement?.firstChild)
				.style('stroke', 'none');
		};

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		const onClick = (node: FuncNode, isValue: boolean) => {
			self.selectedBoxId = node.data.id;
			self.selectedBoxIsValue = isValue;
			self.inputCursorPos = -1;
			self.draw();
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
			.text((d: FuncNode) => d.data.label)
			.on('mouseover', (event) => onMouseOver(event.target))
			.on('mouseout', (event) => onMouseOut(event.target))
			.on('click', (event, node: FuncNode) => onClick(node, false));

		box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.attr('x', (d: FuncNode) => d.boxPadding * this.charWidth)
			.style('fill', (d: FuncNode) => BOX_VALUE_COLORS[d.data.valueType])
			.text((d: FuncNode) => d.data.valueText)
			.on('mouseover', (event) => onMouseOver(event.target))
			.on('mouseout', (event) => onMouseOut(event.target))
			.on('click', (event, node: FuncNode) => onClick(node, true));

		// box.append('title')
		// 	.text((d: FuncNode) => d.data.id);
	}

	private drawInput() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		const node = this.tree.find((n: FuncNode) => n.data.id === this.selectedBoxId);
		if (node === undefined) {
			return;
		}

		this.svg.append('foreignObject')
			.attr('x', this.selectedBoxIsValue ? node.y + node.boxPadding * this.charWidth : node.y)
			.attr('y', node.x - 0.5 * this.charHeight)
			.attr('width', this.selectedBoxIsValue
				? (node.boxWidth - node.boxPadding) * this.charWidth
				: node.boxPadding * this.charWidth)
			.attr('height', this.charHeight)

			.append('xhtml:input')
			.attr('id', 'jaffle_ne_input')
			.attr('type', 'text')
			.attr('value', this.selectedBoxIsValue ? node.data.valueText : node.data.label)

			.on('input', (e) => {
				this.inputCursorPos = e.target.selectionStart;
				const selected = this.tree.find((n: FuncNode) => n.data.id === this.selectedBoxId);
				if (selected !== undefined) {
					if (this.selectedBoxIsValue) {
						selected.data.valueText = e.target.value;
					} else {
						selected.data.label = e.target.value;
					}
					this.initTree();
					self.draw();
				}
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
	}

	private static shouldStack(nodeA: FuncNode, nodeB: FuncNode): boolean {
		const bothAreNone = nodeA.data.type === FuncType.LiteralValue
			&& nodeB.data.type === FuncType.LiteralValue;
		return nodeA.parent === nodeB.parent
			&& (nodeB.data.type === FuncType.Chained || bothAreNone);
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
		return Math.max(...group
			.filter((child: FuncNode) => ![FuncType.MainMininotation, FuncType.Constant]
				.includes(child.data.type))
			.map((child: FuncNode) => child.data.label.length))
			+ (node.data.type === FuncType.LiteralValue ? 0 : 1);
	}

	private static getBoxWidth(node: FuncNode): number {
		const group = JaffleGraph.getGroup(node);
		if (group === undefined) {
			return node.boxPadding;
		}
		return Math.max(...group
			.map((child: FuncNode) => (
				[FuncType.MainMininotation, FuncType.MainExpression].includes(child.data.type)
					? child.data.label.length : node.boxPadding
					+ (child.data.valueType === ValueType.Null ? 2 : child.data.valueText.length)
			)));
	}
}

export default JaffleGraph;
