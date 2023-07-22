import { load as loadYaml } from 'js-yaml';

import { Vertex } from '../dataTypes/vertex';
import * as c from '../constants';
import { Box, BoxType, BoxValueType, Dict } from '../dataTypes/box';

import Importer from './importerInterface';
import { YamlImporterError } from './importerErrors';
import BoxTreeImporter from './boxTreeImporter';

export function getBoxName(rawFunc: Dict<unknown>) {
	const keys = Object.keys(rawFunc);
	if (keys.length === 0) {
		throw new YamlImporterError('function must have an attribute');
	}
	if (keys.length > 1) {
		throw new YamlImporterError('function attribute must be unique');
	}
	return keys[0];
}

export function getBoxType(boxName: string): BoxType {
	const prefix = boxName[0];
	let boxType: BoxType;
	if (prefix === c.CHAINED_FUNC_PREFIX) {
		boxType = BoxType.ChainedFunc;
	} else if (c.MINI_STR_PREFIX) {
		boxType = BoxType.Mininotation;
	} else if (c.EXPR_STR_PREFIX) {
		boxType = BoxType.Expression;
	} else if (c.CONST_FUNC_PREFIX) {
		boxType = BoxType.ConstantDef;
	} else if (boxName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		boxType = BoxType.SerializedData;
	} else {
		boxType = BoxType.MainFunc;
	}
	return boxType;
}

export function getBoxValueType(rawValue: unknown): BoxValueType {
	let boxValueType: BoxValueType;
	if (typeof rawValue === 'string') {
		if (rawValue[0] === c.MINI_STR_PREFIX) {
			boxValueType = BoxValueType.Mininotation;
		} else if (rawValue[0] === c.EXPR_STR_PREFIX) {
			boxValueType = BoxValueType.Expression;
		} else {
			boxValueType = BoxValueType.String;
		}
	} else if (typeof rawValue === 'number') {
		boxValueType = BoxValueType.Number;
	} else if (typeof rawValue === 'boolean') {
		boxValueType = BoxValueType.Boolean;
	} else if (rawValue === null) {
		boxValueType = BoxValueType.Null;
	} else {
		boxValueType = BoxValueType.Empty;
	}
	return boxValueType;
}

export function buildSerializedBoxFromKeyVal(key: string, rawValue: unknown): Box {
	if (rawValue instanceof Object) {
		return {
			name: key,
			type: BoxType.SerializedData,
			value: null,
			valueType: BoxValueType.Empty,
			// eslint-disable-next-line no-use-before-define
			children: Object.keys(rawValue).map((chKey) => buildSerializedBox(
				rawValue instanceof Array ? rawValue[Number(chKey)] : {
					[chKey]: (<Dict<unknown>>rawValue)[chKey],
				},
			)),
		};
	}
	return {
		name: key,
		type: BoxType.SerializedData,
		value: rawValue,
		valueType: getBoxValueType(rawValue),
		children: [],
	};
}

export function buildSerializedBox(rawValue: unknown): Box {
	if (rawValue instanceof Array) {
		return {
			name: '',
			type: BoxType.SerializedData,
			value: null,
			valueType: BoxValueType.Empty,
			children: rawValue.map((rawChild) => buildSerializedBox(rawChild)),
		};
	}
	if (rawValue instanceof Object) {
		const keys = Object.keys(rawValue);
		if (keys.length === 1) {
			return buildSerializedBoxFromKeyVal(keys[0], (<Dict<unknown>>rawValue)[keys[0]]);
		}
		return {
			name: '',
			type: BoxType.SerializedData,
			value: null,
			valueType: BoxValueType.Empty,
			children: keys.map((key) => buildSerializedBox({
				[key]: (<Dict<unknown>>rawValue)[key],
			})),
		};
	}
	return {
		name: '',
		type: BoxType.SerializedData,
		value: rawValue,
		valueType: getBoxValueType(rawValue),
		children: [],
	};
}

export function buildLiteralBox(rawLiteral: unknown): Box {
	return {
		name: '',
		type: BoxType.Literal,
		value: rawLiteral,
		valueType: getBoxValueType(rawLiteral),
		children: [],
	};
}

export function buildListBox(rawList: Array<unknown>): Box {
	if (rawList.length === 0) {
		throw new YamlImporterError('list is empty');
	}

	return {
		name: '',
		type: BoxType.MainFunc,
		value: null,
		valueType: BoxValueType.Empty,
		// eslint-disable-next-line no-use-before-define
		children: buildBoxChildren(rawList),
	};
}

export function buildFuncBox(rawFunc: Dict<unknown>): Box {
	const funcName = getBoxName(rawFunc);
	const funcType = getBoxType(funcName);
	const rawValue = rawFunc[funcName];

	if (funcType === BoxType.SerializedData) {
		return buildSerializedBox(rawFunc);
	}

	if (rawValue instanceof Array) {
		return {
			name: funcName,
			type: funcType,
			value: null,
			valueType: getBoxValueType(rawValue),
			// eslint-disable-next-line no-use-before-define
			children: buildBoxChildren(rawValue),
		};
	}
	return {
		name: funcName,
		type: funcType,
		value: rawValue,
		valueType: getBoxValueType(rawValue),
		children: [],
	};
}

export function buildBoxChildren(rawBoxChildren: Array<unknown>): Array<Box> {
	const children: Array<Box> = [];

	rawBoxChildren.forEach((child: unknown) => {
		if (child instanceof Array) {
			children.push(buildListBox(child));
		} else if (child instanceof Object) {
			children.push(buildFuncBox(<Dict<unknown>>child));
		} else {
			children.push(buildLiteralBox(child));
		}
	});

	return children;
}

export function buildBoxFromYaml(yaml: string): Box {
	let data: unknown;

	try {
		data = loadYaml(yaml);
	} catch (err) {
		throw new YamlImporterError(`can not parse yaml: ${err.message}`);
	}

	if (!(data instanceof Array)) {
		throw new YamlImporterError('yaml root element must be an array');
	}
	const rawComposition = <Array<unknown>> data;

	return {
		name: '',
		type: BoxType.MainFunc,
		value: null,
		valueType: BoxValueType.Empty,
		children: buildBoxChildren(rawComposition),
	};
}

export const YamlImporter: Importer = {
	toBox(yaml: unknown): Box {
		if (typeof yaml !== 'string') {
			throw new YamlImporterError('YamlImporter input must be a string');
		}
		return buildBoxFromYaml(yaml);
	},
	toVertex(yaml: unknown): Vertex {
		if (typeof yaml !== 'string') {
			throw new YamlImporterError('YamlImporter input must be a string');
		}
		const box = buildBoxFromYaml(yaml);
		return BoxTreeImporter.toVertex(box);
	},
};

export default YamlImporter;
