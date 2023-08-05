import * as d3 from 'd3';
import { flextree } from 'd3-flextree';

import entryToBox from '../exporters/boxExporter';
import boxToEntry from '../importers/boxImporter';
import { Box, Entry, EntryType, ValueType, StringDict } from '../model';
import { JaffleError } from '../errors';

import { AbstractEditor } from './abstractEditor';

type Coordinates = [number, number];

type FuncNode = d3.id<Box> & {
	x: number,
	y: number,
};

type OnUpdate = (rawContent: Box) => void;

type NodeEditorConfig = {
	onUpdate: OnUpdate,
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

class NodeEditor extends AbstractEditor {
	config: NodeEditorConfig;

	domContainer: HTMLDivElement;

	domSvg: SVGElement;

	svgWidth: number;

	svgHeight: number;

	offsetX: number;

	offsetY: number;

	_svg: d3.Selection<SVGSVGElement, undefined, null, undefined> | null;

	_tree: FuncNode | null;

	constructor(config: NodeEditorConfig) {
		super();
		this.config = {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			onUpdate: config.onUpdate || (() => {}),
		};

		this.uiConfig = {
			width: 800,
			height: 600,
			fontSize: 16,
			hBoxGap: 3,
			vBoxGap: 1,
		};

		this.domContainer = new HTMLDivElement();
		this.domSvg = new SVGElement();
		this.svgWidth = 0;
		this.svgHeight = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this._svg = null;
		this._tree = null;
	}

	get charWidth(): number {
		return this.uiConfig.fontSize * 0.6;
	}

	get charHeight(): number {
		return this.uiConfig.fontSize * 1.4;
	}

	build(): void {
		const width = (this.uiConfig.width === 0 ? window.innerWidth : this.uiConfig.width) - 10;
		const height = (this.uiConfig.height === 0
			? window.innerHeight : this.uiConfig.height) - 35;

		this.domContainer = document.createElement('div');
		this.domContainer.classList.add('jaffle-graph-container');
		this.domContainer.style.position = 'absolute';
		this.domContainer.style.top = '35px';
		this.domContainer.style.left = '10px';
		this.domContainer.style.width = `${width}px`;
		this.domContainer.style.height = `${height}px`;
		this.domContainer.style.overflow = 'scroll';
		this.domEditor.appendChild(this.domContainer);
	}

	get svg(): d3.Selection<SVGSVGElement, undefined, null, undefined> {
		if (this._svg === null) {
			throw new JaffleError('svg is not initialized');
		}
		return this._svg;
	}

	get tree(): FuncNode {
		if (this._tree === null) {
			throw new JaffleError('tree is not initialized');
		}
		return this._tree;
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
		this._tree = <FuncNode> d3.hierarchy(content);
		this.initTree();
		this.draw();
	}

	public initTree(): void {
		const layout = flextree({})
			.nodeSize((n: FuncNode) => (
				[this.charHeight, (n.data.width + this.uiConfig.hBoxGap) * this.charWidth]
			))
			.spacing((a: FuncNode, b: FuncNode) => {
				const bothAreValue = a.data.type === EntryType.Value
					&& b.data.type === EntryType.Value;
				const shouldStack = a.parent === b.parent
					&& (bothAreValue || b.data.type === EntryType.ChainedFunction);
				return shouldStack ? 0 : this.uiConfig.vBoxGap * this.charHeight;
			});

		layout(this.tree);
		this.setGraphGeometry();
	}

	public setGraphGeometry(): void {
		let minNodeY = Infinity;
		let maxNodeY = -Infinity;
		let svgWidth = 0;

		this.tree.each((node: FuncNode) => {
			if (node.y + node.data.width * this.charWidth > svgWidth) {
				svgWidth = node.y + (node.data.width - this.uiConfig.hBoxGap) * this.charWidth;
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
		this.offsetX = ((<FuncNode> this.tree).data.width + this.uiConfig.hBoxGap) * this.charWidth;
		this.offsetY = minNodeY - this.charHeight;
	}

	public draw(): NodeEditor {
		this.drawSvg();
		this.domSvg?.remove();
		this.domSvg = <SVGElement> this.svg.node();
		this.domContainer.appendChild(this.domSvg);
		return this;
	}

	private drawSvg(): void {
		this._svg = d3.create('svg')
			.attr('class', 'jaffle-graph')
			.attr('width', this.svgWidth)
			.attr('height', this.svgHeight)
			.attr('viewBox', [this.offsetX, this.offsetY, this.svgWidth, this.svgHeight])
			.style('font', `${this.uiConfig.fontSize}px mono`);

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

	private drawInput(selectedBoxId: string, isValueSelected: boolean): void {
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
			.attr('id', 'jaffle-ne-input')
			.attr('type', 'text')
			.attr('value', isValueSelected ? focusedNode.data.rawValue : focusedNode.data.rawName)

			.on('input', () => this.config.onUpdate(this.tree.data))
			.on('change', (event: Event) => {
				const rawText = (<HTMLInputElement>event.target).value;

				if (isValueSelected) {
					focusedNode.data.rawValue = rawText;
				} else {
					focusedNode.data.rawName = rawText;
				}

				this.reload();
				this.draw();
			})
			.on('focusout', (event: Event) => {
				const target = <HTMLInputElement>event.target;
				target.parentElement?.remove();
			})

			.style('width', '100%')
			.style('padding', '0')
			.style('font-size', `${this.uiConfig.fontSize}px`)
			.style('font-family', 'monospace')
			.style('background-color', '#aaa')
			.style('color', isValueSelected
				? BOX_VALUE_COLORS[focusedNode.data.valueType]
				: BOX_NAME_COLORS[focusedNode.data.type])
			.style('font-weight', isValueSelected
				|| focusedNode.data.type === EntryType.ChainedFunction
				? 'normal' : 'bold')
			.style('border', 'none')
			.style('border-radius', '3px');

		const domInput = <HTMLInputElement>document.getElementById('jaffle-ne-input');
		domInput.focus();
		domInput.selectionStart = 9999;
	}

	getNodeById(id: string): FuncNode | undefined {
		return this.tree.find((n: FuncNode) => n.data.id === id);
	}
}

export default NodeEditor;
