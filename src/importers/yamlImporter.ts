import { load as loadYaml } from 'js-yaml';

import * as c from '../constants';
import { Box, Dict, BoxType, BoxValueType } from '../boxInterfaces';

import { YamlImporterError } from './importerErrors';

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
	} else if (prefix === c.CONST_FUNC_PREFIX) {
		boxType = BoxType.ConstantDef;
	} else if (boxName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		boxType = BoxType.SerializedData;
	} else {
		boxType = BoxType.MainFunc;
	}
	return boxType;
}

export function valueToValueType(value: unknown, specialString = true): BoxValueType {
	let boxValueType: BoxValueType;
	if (typeof value === 'string') {
		boxValueType = BoxValueType.String;
		if (specialString) {
			if (value[0] === c.MINI_STR_PREFIX) {
				boxValueType = BoxValueType.Mininotation;
			} else if (value[0] === c.EXPR_STR_PREFIX) {
				boxValueType = BoxValueType.Expression;
			}
		}
	} else if (typeof value === 'number') {
		boxValueType = BoxValueType.Number;
	} else if (typeof value === 'boolean') {
		boxValueType = BoxValueType.Boolean;
	} else if (value === null) {
		boxValueType = BoxValueType.Null;
	} else {
		boxValueType = BoxValueType.Empty;
	}
	return boxValueType;
}

export function keyValToSerializedBox(key: string, rawValue: unknown): Box {
	if (rawValue instanceof Object) {
		return {
			rawName: key,
			type: BoxType.SerializedData,
			rawValue: '',
			valueType: BoxValueType.Empty,
			// eslint-disable-next-line no-use-before-define
			children: Object.keys(rawValue).map((chKey) => valueToSerializedBox(
				rawValue instanceof Array ? rawValue[Number(chKey)] : {
					[chKey]: (<Dict<unknown>>rawValue)[chKey],
				},
			)),
		};
	}
	return {
		rawName: key,
		type: BoxType.SerializedData,
		rawValue: `${rawValue}`,
		valueType: valueToValueType(rawValue, false),
		children: [],
	};
}

export function valueToSerializedBox(rawValue: unknown): Box {
	if (rawValue instanceof Array) {
		return {
			rawName: '',
			type: BoxType.SerializedData,
			rawValue: '',
			valueType: BoxValueType.Empty,
			children: rawValue.map((rawChild) => valueToSerializedBox(rawChild)),
		};
	}
	if (rawValue instanceof Object) {
		const keys = Object.keys(rawValue);
		if (keys.length === 1) {
			return keyValToSerializedBox(keys[0], (<Dict<unknown>>rawValue)[keys[0]]);
		}
		return {
			rawName: '',
			type: BoxType.SerializedData,
			rawValue: '',
			valueType: BoxValueType.Empty,
			children: keys.map((key) => valueToSerializedBox({
				[key]: (<Dict<unknown>>rawValue)[key],
			})),
		};
	}
	return {
		rawName: '',
		type: BoxType.SerializedData,
		rawValue: `${rawValue}`,
		valueType: valueToValueType(rawValue, false),
		children: [],
	};
}

export function buildLiteralBox(rawLiteral: unknown): Box {
	return {
		rawName: '',
		type: BoxType.Value,
		rawValue: `${rawLiteral}`,
		valueType: valueToValueType(rawLiteral),
		children: [],
	};
}

export function buildListBox(rawList: Array<unknown>): Box {
	if (rawList.length === 0) {
		throw new YamlImporterError('list is empty');
	}

	return {
		rawName: '',
		type: BoxType.List,
		rawValue: '',
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
		return valueToSerializedBox(rawFunc);
	}

	if (rawValue instanceof Array) {
		return {
			rawName: funcName,
			type: funcType,
			rawValue: '',
			valueType: valueToValueType(rawValue),
			// eslint-disable-next-line no-use-before-define
			children: buildBoxChildren(rawValue),
		};
	}
	return {
		rawName: funcName,
		type: funcType,
		rawValue: `${rawValue}`,
		valueType: valueToValueType(rawValue),
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

export function yamlToBox(yaml: string): Box {
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
		rawName: '',
		type: BoxType.MainFunc,
		rawValue: '',
		valueType: BoxValueType.Empty,
		children: buildBoxChildren(rawComposition),
	};
}

export default yamlToBox;
