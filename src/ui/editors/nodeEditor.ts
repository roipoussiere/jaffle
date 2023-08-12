import * as d3 from 'd3';
import { flextree } from 'd3-flextree';

import { Entry, EntryType, ValueType, StringDict } from '../../model';
import { JaffleError, UndefError as UndefErr } from '../../errors';
import entryToBox from '../../transpilers/graph/graphExporter';
import boxToEntry from '../../transpilers/graph/graphImporter';
import { Box } from '../../transpilers/graph/graphModel';

import { AbstractEditor } from './abstractEditor';
import { Tab } from '../widgets/editorBar';

type Coordinates = [number, number];

type FuncNode = d3.id<Box> & {
	x: number,
	y: number,
};

type NodeConfig = {
	hBoxGap: number,
	vBoxGap: number,
};

const DEFAULT_NODE_CONFIG: NodeConfig = {
	hBoxGap: 3,
	vBoxGap: 1,
};

const BOX_NAME_COLORS: StringDict = {
	[EntryType.Function]: 'black',
	[EntryType.ChainedFunction]: 'black',
	[EntryType.ConstantDef]: 'blue',
	[EntryType.SerializedData]: 'darkRed',
};

const BOX_VALUE_COLORS: StringDict = {
	[ValueType.String]: 'darkSlateGray',
	[ValueType.Number]: 'darkRed',
	[ValueType.Boolean]: 'darkGreen',
	[ValueType.Mininotation]: 'green',
	[ValueType.Expression]: 'blue',
};

export class NodeEditor extends AbstractEditor {
	nodeConfig: NodeConfig;

	svgWidth: number;

	svgHeight: number;

	offsetX: number;

	offsetY: number;

	focusedBoxId: string;

	isTyping: boolean;

	domSvg?: SVGElement;

	private _domContainer: HTMLDivElement;

	private _svg?: d3.Selection<SVGSVGElement, undefined, null, undefined>;

	private _tree?: FuncNode;

	constructor(nodeConfig: Partial<NodeConfig>) {
		super();
		this.nodeConfig = { ...DEFAULT_NODE_CONFIG, ...nodeConfig };

		this.svgWidth = 0;
		this.svgHeight = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.focusedBoxId = '';
		this.isTyping = false;
	}

	get svg() { return this._svg || (function t() { throw new UndefErr(); }()); }

	get tree() { return this._tree || (function t() { throw new UndefErr(); }()); }

	get domContainer() { return this._domContainer || (function t() { throw new UndefErr(); }()); }

	// eslint-disable-next-line class-methods-use-this
	get tab(): Tab {
		return {
			id: 'node',
			label: 'Node',
			tooltip: 'Switch to node editor',
		};
	}

	get charWidth(): number {
		return this.config.fontSize * 0.6;
	}

	get charHeight(): number {
		return this.config.fontSize * 1.4;
	}

	build(): void {
		this._domContainer = document.createElement('div');
		this.domContainer.classList.add('jaffle-graph-container');
		this.domContainer.style.position = 'absolute';
		this.domContainer.style.top = '35px';
		this.domContainer.style.left = '10px';
		this.domContainer.style.width = `${this.config.width - 10}px`;
		this.domContainer.style.height = `${this.config.height - 35}px`;
		this.domContainer.style.overflow = 'scroll';
		this.domEditor.appendChild(this.domContainer);
		this.addKeyboardEvents();
	}

	getDom(): HTMLElement {
		return this.domContainer;
	}

	getContent(): Entry {
		return boxToEntry(this.tree.data);
	}

	getRawContent(): Box {
		return this.tree.data;
	}

	setContent(content: Entry): void {
		this.setRawContent(entryToBox(content));
	}

	setRawContent(content: Box): void {
		this._tree = d3.hierarchy(content) as FuncNode;
		this.initTree();
		this.draw();
	}

	initTree(): void {
		const layout = flextree({})
			.nodeSize((n: FuncNode) => (
				[this.charHeight, (n.data.width + this.nodeConfig.hBoxGap) * this.charWidth]
			))
			.spacing((a: FuncNode, b: FuncNode) => {
				const bothAreValue = a.data.type === EntryType.Value
					&& b.data.type === EntryType.Value;
				const shouldStack = a.parent === b.parent
					&& (bothAreValue || b.data.type === EntryType.ChainedFunction);
				return shouldStack ? 0 : this.nodeConfig.vBoxGap * this.charHeight;
			});

		layout(this.tree);
		this.setGraphGeometry();
	}

	focusBox(boxId: string): void {
		if (this.focusedBoxId !== '') {
			d3.select(`#${this.focusedBoxId}`).style('opacity', 0);
		}
		this.focusedBoxId = boxId;
		d3.select(`#${this.focusedBoxId}`).style('opacity', 0.2);
	}

	setGraphGeometry(): void {
		let minNodeY = Infinity;
		let maxNodeY = -Infinity;
		let svgWidth = 0;

		this.tree.each((node: FuncNode) => {
			if (node.y + node.data.width * this.charWidth > svgWidth) {
				svgWidth = node.y + (node.data.width - this.nodeConfig.hBoxGap) * this.charWidth;
			}
			if (node.x > maxNodeY) {
				maxNodeY = node.x;
			}
			if (node.x < minNodeY) {
				minNodeY = node.x;
			}
		});

		this.svgWidth = svgWidth;
		this.svgHeight = maxNodeY - minNodeY + this.charHeight * 2;
		this.offsetX = ((this.tree as FuncNode).data.width + this.nodeConfig.hBoxGap)
			* this.charWidth;
		this.offsetY = minNodeY - this.charHeight;
	}

	draw(): void {
		this.drawSvg();
		this.domSvg?.remove();
		this.domSvg = this.svg.node() as SVGElement;
		this.domContainer.appendChild(this.domSvg);
		if (this.tree.children && this.tree.children.length > 0) {
			this.focusBox(`k${this.tree.children[0].data.id}`);
		}
	}

	// eslint-disable-next-line class-methods-use-this
	private addKeyboardEvents() {
		document.addEventListener('keydown', (event) => {
			// console.log(event);

			if (event.key === 'Enter') {
				if (this.isTyping) {
					this.validateInput();
				} else {
					this.drawInput();
				}
			}
		});
	}

	private drawSvg(): void {
		this._svg = d3.create('svg')
			.attr('class', 'jaffle-graph')
			.attr('width', this.svgWidth)
			.attr('height', this.svgHeight)
			.attr('viewBox', [this.offsetX, this.offsetY, this.svgWidth, this.svgHeight])
			.style('font', `${this.config.fontSize}px mono`);

		this.drawLinks();
		this.drawGroupArea();
		this.drawBoxes();
	}

	private drawLinks(): void {
		this.svg.append('g')
			.attr('fill', 'none')
			.attr('stroke', '#777')
			.attr('stroke-width', 2)
			.selectAll()
			.data(this.tree.links().filter((d: d3.HierarchyLink<Box>) => (
				d.source.depth >= 1 && d.target.data.type !== EntryType.ChainedFunction
			)))
			.join('path')
			.attr('d', (link: d3.HierarchyLink<Box>) => d3.linkHorizontal()
				.x((_n: Coordinates) => {
					const n = _n as unknown as FuncNode;
					return n.y === (link.source as unknown as FuncNode).y
						? n.y + n.data.width * this.charWidth : n.y;
				})
				.y(
					(n: Coordinates) => (n as unknown as FuncNode).x,
				)(link as unknown as d3.DefaultLinkObject));
	}

	private drawGroupArea(): void {
		this.svg.append('g')
			.selectAll()
			.data(this.tree.descendants()
				.filter((n: FuncNode) => n.data.type !== EntryType.ChainedFunction))
			.join('rect')
			.attr('width', (node: FuncNode) => (node.data.width - 0.5) * this.charWidth)
			.attr('height', (node: FuncNode) => {
				const lastSibling = this.getNodeById(node.data.lastSiblingId);
				return lastSibling === undefined ? 0 : lastSibling.x - node.x;
			})
			.attr('x', (node: FuncNode) => node.y + 0.25 * this.charWidth)
			.attr('y', (node: FuncNode) => node.x)
			.attr('fill', '#ccc8');
	}

	private drawBoxes(): void {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;

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
			.style('font-weight', (n: FuncNode) => (n.data.type !== EntryType.ChainedFunction
				? 'bold' : 'normal'))
			.text((d: FuncNode) => d.data.displayName);

		box.append('text')
			.attr('y', 0.27 * this.charHeight)
			.attr('x', (d: FuncNode) => d.data.padding * this.charWidth)
			.style('fill', (d: FuncNode) => BOX_VALUE_COLORS[d.data.valueType])
			.style('font-weight', (n: FuncNode) => (n.data.type === EntryType.Value
				&& (n.data.valueType === ValueType.Mininotation
				|| n.data.valueType === ValueType.Expression)
				? 'bold' : 'normal'))
			.text((d: FuncNode) => d.data.displayValue);

		box.append('rect')
			.attr('id', (n: FuncNode) => `k${n.data.id}`)
			.attr('width', (n: FuncNode) => n.data.padding * this.charWidth)
			.attr('height', 1 * this.charHeight)
			.attr('y', -0.5 * this.charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('opacity', 0)
			.on('mouseover', (event, n: FuncNode) => this.focusBox(`k${n.data.id}`))
			.on('click', () => self.drawInput());

		box.append('rect')
			.attr('id', (n: FuncNode) => `v${n.data.id}`)
			.attr('width', (n: FuncNode) => (n.data.width - n.data.padding) * this.charWidth)
			.attr('height', 1 * this.charHeight)
			.attr('x', (n: FuncNode) => n.data.padding * this.charWidth)
			.attr('y', -0.5 * this.charHeight)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('opacity', 0)
			.on('mouseover', (event, n: FuncNode) => this.focusBox(`v${n.data.id}`))
			.on('click', () => self.drawInput());

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

	private drawInput(): void {
		const isKey = this.focusedBoxId[0] === 'k';
		const focusedNode = this.getNodeById(this.focusedBoxId.substring(1));
		if (focusedNode === undefined) {
			return;
		}

		this.isTyping = true;

		this.svg.append('foreignObject')
			.attr('x', isKey ? focusedNode.y
				: focusedNode.y + focusedNode.data.padding * this.charWidth)
			.attr('y', focusedNode.x - 0.5 * this.charHeight)
			.attr('width', this.charWidth * (3 + (isKey
				? focusedNode.data.padding : (focusedNode.data.width - focusedNode.data.padding))))
			.attr('height', this.charHeight)

			.append('xhtml:input')
			.attr('id', 'jaffle-ne-input')
			.attr('type', 'text')
			.attr('value', isKey ? focusedNode.data.rawName : focusedNode.data.rawValue)

			.on('input', () => this.config.onUpdate(this.tree.data))
			// .on('change', (event: Event) => {})
			.on('focusout', () => this.validateInput())

			.style('width', '100%')
			.style('padding', '0')
			.style('font-size', `${this.config.fontSize}px`)
			.style('font-family', 'monospace')
			.style('background-color', '#aaa')
			.style('color', isKey
				? BOX_NAME_COLORS[focusedNode.data.type]
				: BOX_VALUE_COLORS[focusedNode.data.valueType])
			.style('font-weight', !isKey || focusedNode.data.type === EntryType.ChainedFunction
				? 'normal' : 'bold')
			.style('border', 'none')
			.style('border-radius', '3px');

		const domInput = document.getElementById('jaffle-ne-input') as HTMLInputElement;
		domInput.focus();
		domInput.selectionStart = 9999;
	}

	private getNodeById(id: string): FuncNode | undefined {
		return this.tree.find((n: FuncNode) => n.data.id === id);
	}

	private validateInput(): void {
		console.log('validating');
		const domInput = document.getElementById('jaffle-ne-input') as HTMLInputElement;

		if (domInput === null) {
			throw new JaffleError('input dom not found');
		}

		this.isTyping = false;
		const isKey = this.focusedBoxId[0] === 'k';
		const focusedNode = this.getNodeById(this.focusedBoxId.substring(1));

		if (focusedNode === undefined) {
			throw new JaffleError('focused box dom not found');
		}

		if (isKey) {
			focusedNode.data.rawName = domInput.value;
		} else {
			focusedNode.data.rawValue = domInput.value;
		}

		this.reload();
		this.draw();
		domInput.parentElement?.remove();
	}
}

export default NodeEditor;
