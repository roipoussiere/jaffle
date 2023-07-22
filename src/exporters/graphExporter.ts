import { Box, BoxType, BoxValueType } from '../dataTypes/box';
import { GraphBox, PartialGraphBox as PartialGBox } from '../dataTypes/graphBox';

// function arrangeTree(vertex: Vertex): DraftBox {
// 	if (vertex.type === VertexType.Literal) {
// 		return {
// 			funcName: '',
// 			funcType: VertexType.Literal,
// 			value: vertex.value,
// 			valueType: VertexType.Literal,
// 			children: [],
// 		};
// 	}

// 	if (typeof vertex.value !== 'string') {
// 		throw new GraphExporterError(`Vertex value "${vertex.value}" must be a string`);
// 	}

// 	if (vertex.children.length === 1 && vertex.children[0].children.length === 0) {
// 		return {
// 			funcName: vertex.value,
// 			funcType: vertex.type,
// 			value: vertex.children[0].value,
// 			valueType: vertex.children[0].type,
// 			children: [],
// 		};
// 	}

// 	return {
// 		funcName: vertex.value,
// 		funcType: vertex.type,
// 		value: vertex.children[0].value,
// 		valueType: vertex.children[0].type,
// 		children: vertex.children.map((child) => arrangeTree(child)),
// 	};
// }

// function getFuncText(func: DraftBox): string {
// 	return func.funcName;
// }

// function getvalueText(func: DraftBox): string {
// 	return func.value === null ? '' : `${func.value}`;
// }

export function boxToPartialGBox(box: Box, funcId: Array<number> = [], groupId = 0): PartialGBox {
	let paramsGroupId = -1;

	const children = box.children.length <= 1 ? [] : box.children.map((child, i) => {
		if (child.type !== BoxType.ChainedFunc) {
			paramsGroupId += 1;
		}
		return boxToPartialGBox(
			child,
			funcId.concat(i),
			paramsGroupId,
		);
	});

	return {
		name: box.name,
		type: box.type,
		valueText: `${box.value}`,
		valueType: box.valueType,
		id: funcId.join('-'),
		groupId,
		children,
	};
}

export function partialGBoxToGBox(pgb: PartialGBox, parent?: PartialGBox): GraphBox {
	const noSpace = pgb.type === BoxType.Value || pgb.valueType === BoxValueType.Null;

	const contentWidth = pgb.name.length
		+ pgb.valueText.length + (noSpace ? 0 : 1);

	const group = parent?.children.filter((child) => child.groupId === pgb.groupId);

	let padding: number;
	let width: number;

	if (group === undefined) {
		padding = pgb.name.length + 1;
		width = contentWidth;
	} else {
		const maxLength = Math.max(...group
			// .filter((child: PartialGraphBox) => child.type !== BoxType.Mininotation)
			.map((child) => child.name.length));

		padding = maxLength + 1; // + (pbt.funcType === FuncType.Literal ? 0 : 1);

		const getDataWidth = (box: PartialGBox) => padding
			+ (pgb.valueType === BoxValueType.Null ? 2 : box.valueText.length);

		width = Math.max(...group.map((child: PartialGBox) => (
			child.type < BoxType.MainFunc ? child.name.length : getDataWidth(child)
		)));
	}

	return {
		...pgb,
		contentWidth,
		padding,
		width,
		children: pgb.children.map((child) => partialGBoxToGBox(child, pgb)),
	};
}

export function boxToGraphBox(box: Box): GraphBox {
	// const arrangedTree = arrangeTree(composition);
	const partialBoxTree = boxToPartialGBox(box);
	return partialGBoxToGBox(partialBoxTree);
}

export default boxToGraphBox;
