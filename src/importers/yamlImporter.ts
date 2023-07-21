import { load as loadYaml } from 'js-yaml';

import { Vertex } from '../dataTypes/vertex';
import * as c from '../constants';
import { Box, BoxType, BoxValueType, Dict } from '../dataTypes/box';

import Importer from './importerInterface';
import { YamlImporterError } from './importerErrors';
import BoxTreeImporter from './boxTreeImporter';

function getFuncName(rawFunc: Dict<unknown>) {
	const keys = Object.keys(rawFunc);
	if (keys.length === 0) {
		throw new YamlImporterError('function must have an attribute');
	}
	if (keys.length > 1) {
		throw new YamlImporterError('function attribute must be unique');
	}
	return keys[0];
}

function getFuncType(funcName: string): BoxType {
	const prefix = funcName[0];
	const funcTypes: Dict<BoxType> = {
		[c.CHAINED_FUNC_PREFIX]: BoxType.ChainedFunc,
		[c.MINI_STR_PREFIX]: BoxType.Mininotation,
		[c.EXPR_STR_PREFIX]: BoxType.Expression,
		[c.CONST_FUNC_PREFIX]: BoxType.ConstantDef,
	};
	if (prefix in funcTypes) {
		return funcTypes[prefix];
	}
	if (funcName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		return BoxType.SerializedData;
	}
	return BoxType.MainFunc;
}

function getValueType(rawValue: unknown): BoxValueType {
	if (typeof rawValue === 'string') {
		if (rawValue[0] === c.MINI_STR_PREFIX) {
			return BoxValueType.Mininotation;
		}
		if (rawValue[0] === c.EXPR_STR_PREFIX) {
			return BoxValueType.Expression;
		}
	}
	// if (rawValue instanceof Object) {
	// 	return VertexType.Tree;
	// }
	return BoxValueType.String;
}

function computeLiteral(rawLiteral: unknown): Box {
	if (typeof rawLiteral === 'string') {
		const stringFuncType = getFuncType(rawLiteral);
		if ([BoxType.Mininotation, BoxType.Expression].includes(stringFuncType)) {
			return {
				name: rawLiteral,
				type: stringFuncType,
				value: null,
				valueType: BoxValueType.Empty,
				children: [],
			};
		}
	}

	return {
		name: '',
		type: BoxType.Literal,
		value: rawLiteral,
		valueType: getValueType(rawLiteral),
		children: [],
	};
}

function computeParams(rawParams: Array<unknown>): Array<Box> {
	const params: Array<Box> = [];

	rawParams.forEach((rawParam: unknown) => {
		if (rawParam instanceof Array) {
			params.push(this.computeList(rawParam));
		} else if (rawParam instanceof Object) {
			params.push(this.computeFunc(<Dict<unknown>>rawParam));
		} else {
			params.push(computeLiteral(rawParam));
		}
	});

	return params;
}

function yamlToBox(yaml: string): Box {
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
		children: computeParams(rawComposition),
	};
}

function computeList(rawList: Array<unknown>): Box {
	if (rawList.length === 0) {
		throw new YamlImporterError('list is empty');
	}

	return {
		name: '',
		type: BoxType.MainFunc,
		value: null,
		valueType: BoxValueType.Empty,
		children: computeParams(rawList),
	};
}

function serializeEntry(key: string, rawValue: unknown): Box {
	if (rawValue instanceof Object) {
		return {
			name: key,
			type: BoxType.SerializedData,
			value: null,
			valueType: BoxValueType.Empty,
			// eslint-disable-next-line no-use-before-define
			children: Object.keys(rawValue).map((chKey) => serialize(
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
		valueType: BoxValueType.String,
		children: [],
	};
}

function serialize(rawValue: unknown): Box {
	if (rawValue instanceof Array) {
		return {
			name: '',
			type: BoxType.SerializedData,
			value: null,
			valueType: BoxValueType.Empty,
			children: rawValue.map((rawChild) => serialize(rawChild)),
		};
	}
	if (rawValue instanceof Object) {
		const keys = Object.keys(rawValue);
		if (keys.length === 1) {
			return serializeEntry(keys[0], (<Dict<unknown>>rawValue)[keys[0]]);
		}
		return {
			name: '',
			type: BoxType.SerializedData,
			value: null,
			valueType: BoxValueType.Empty,
			children: keys.map((key) => serialize({
				[key]: (<Dict<unknown>>rawValue)[key],
			})),
		};
	}
	return {
		name: '',
		type: BoxType.SerializedData,
		value: rawValue,
		valueType: BoxValueType.String,
		children: [],
	};
}

function computeFunc(rawFunc: Dict<unknown>): Box {
	const funcName = getFuncName(rawFunc);
	const funcType = getFuncType(funcName);
	const rawValue = rawFunc[funcName];

	if (funcType === BoxType.SerializedData) {
		return serialize(rawFunc);
	}

	return {
		name: funcName,
		type: funcType,
		value: rawValue instanceof Array ? null : rawValue,
		valueType: getValueType(rawValue),
		children: rawValue instanceof Array ? computeParams(rawValue) : [],
	};
}

const YamlImporter: Importer = {
	import(yaml: string): Vertex {
		const box = yamlToBox(yaml);
		return BoxTreeImporter.import(box);
	},
};

export default YamlImporter;
