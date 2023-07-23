import { Entry, Box, PartialBox, BoxType, ValueType } from '../model';
import * as c from '../constants';

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

export function rawNameToType(rawName: string): BoxType {
	let vBoxType: BoxType;
	if (rawName === '') {
		vBoxType = BoxType.Value;
	} else if (rawName[0] === c.CHAINED_FUNC_PREFIX) {
		vBoxType = BoxType.ChainedFunc;
	} else if (rawName[0] === c.CONST_FUNC_PREFIX) {
		vBoxType = BoxType.ConstantDef;
	} else if (rawName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		vBoxType = BoxType.SerializedData;
	// } else if () {
	// 	vBoxType = VBoxType.List;
	} else {
		vBoxType = BoxType.MainFunc;
	}
	return vBoxType;
}

export function rawValueToValueType(rawValue: string, specialString = true): ValueType {
	let boxValueType: ValueType;
	if (specialString && rawValue[0] === c.MINI_STR_PREFIX) {
		boxValueType = ValueType.Mininotation;
	} else if (specialString && rawValue[0] === c.EXPR_STR_PREFIX) {
		boxValueType = ValueType.Expression;
	} else if (!Number.isNaN(rawValue)) {
		boxValueType = ValueType.Number;
	} else if (rawValue === 'true' || rawValue === 'false') {
		boxValueType = ValueType.Boolean;
	} else if (rawValue === '') {
		boxValueType = ValueType.Null;
	} else {
		boxValueType = ValueType.String;
	}
	return boxValueType;
}

export function rawNameToDisplayName(rawName: string): string {
	return rawName; // TODO
}

export function rawValueToDisplayValue(rawValue: string): string {
	return `${rawValue}`; // TODO
}

export function boxToPartialVBox(box: Entry, funcId: Array<number> = [], groupId = 0): PartialBox {
	let paramsGroupId = -1;

	return {
		rawName: box.rawName,
		rawValue: box.rawValue,

		id: funcId.join('-'),
		groupId,

		displayName: rawNameToDisplayName(box.rawName),
		displayValue: rawValueToDisplayValue(box.rawValue),

		// const children = box.children.length <= 1 ? [] : box.children.map((child, i) => {
		children: box.children.map((child, i) => {
			if (child.rawName[0] === c.CHAINED_FUNC_PREFIX) {
				paramsGroupId += 1;
			}
			return boxToPartialVBox(
				child,
				funcId.concat(i),
				paramsGroupId,
			);
		}),
	};
}

export function partialVBoxToVBox(pvb: PartialBox, parent?: PartialBox): Box {
	const type = rawNameToType(pvb.rawName);
	const valueType = rawValueToValueType(pvb.rawValue);
	const noSpace = type === BoxType.Value || valueType === ValueType.Null;
	const contentWidth = pvb.displayName.length + pvb.displayValue.length + (noSpace ? 0 : 1);
	const group = parent?.children.filter((child) => child.groupId === pvb.groupId);

	let padding: number;
	let width: number;

	if (group === undefined) {
		padding = pvb.displayName.length + 1;
		width = contentWidth;
	} else {
		const maxLength = Math.max(...group.map((child) => child.displayName.length));
		padding = maxLength + 1; // + (pbt.funcType === FuncType.Literal ? 0 : 1);

		// const getDataWidth = (box: PartialVBox) => padding
		// 	+ (valueType === VBoxValueType.Null ? 2 : box.displayName.length);

		width = Math.max(...group.map((child: PartialBox) => (
			padding + (valueType === ValueType.Null ? 2 : child.displayName.length)
			// child.type < VBoxType.MainFunc ? child.displayName.length : getDataWidth(child)
		)));
	}

	return {
		...pvb,
		type,
		valueType,
		contentWidth,
		padding,
		width,
		children: pvb.children.map((child) => partialVBoxToVBox(child, pvb)),
	};
}

export function entryToBox(entry: Entry): Box {
	// const arrangedTree = arrangeTree(composition);
	const partialBoxTree = boxToPartialVBox(entry);
	return partialVBoxToVBox(partialBoxTree);
}

export default entryToBox;