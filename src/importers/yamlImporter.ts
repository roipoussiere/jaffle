import { load as loadYaml } from 'js-yaml';

import { Vertex } from '../dataTypes/vertex';
import * as c from '../constants';
import { Box, BoxType, BoxValueType, Dict } from '../dataTypes/box';

import AbstractImporter from './abstractImporter';
import { YamlImporterError } from './importerErrors';
import BoxTreeImporter from './boxTreeImporter';

class YamlImporter extends AbstractImporter {
	static import(yaml: string): Vertex {
		const box = YamlImporter.YamlToBox(yaml);
		return BoxTreeImporter.import(box);
	}

	static YamlToBox(yaml: string): Box {
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
			children: YamlImporter.computeParams(rawComposition),
		};
	}

	static computeParams(rawParams: Array<unknown>): Array<Box> {
		const params: Array<Box> = [];

		rawParams.forEach((rawParam: unknown) => {
			if (rawParam instanceof Array) {
				params.push(this.computeList(rawParam));
			} else if (rawParam instanceof Object) {
				params.push(this.computeFunc(<Dict<unknown>>rawParam));
			} else {
				params.push(YamlImporter.computeLiteral(rawParam));
			}
		});

		return params;
	}

	static computeList(rawList: Array<unknown>): Box {
		if (rawList.length === 0) {
			throw new YamlImporterError('list is empty');
		}

		return {
			name: '',
			type: BoxType.MainFunc,
			value: null,
			valueType: BoxValueType.Empty,
			children: YamlImporter.computeParams(rawList),
		};
	}

	static computeFunc(rawFunc: Dict<unknown>): Box {
		const funcName = YamlImporter.getFuncName(rawFunc);
		const funcType = YamlImporter.getFuncType(funcName);
		const rawValue = rawFunc[funcName];

		if (funcType === BoxType.SerializedData) {
			return YamlImporter.serialize(rawFunc);
		}

		return {
			name: funcName,
			type: funcType,
			value: rawValue instanceof Array ? null : rawValue,
			valueType: YamlImporter.getValueType(rawValue),
			children: rawValue instanceof Array ? YamlImporter.computeParams(rawValue) : [],
		};
	}

	static computeLiteral(rawLiteral: unknown): Box {
		if (typeof rawLiteral === 'string') {
			const stringFuncType = YamlImporter.getFuncType(rawLiteral);
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
			valueType: YamlImporter.getValueType(rawLiteral),
			children: [],
		};
	}

	static serialize(rawValue: unknown): Box {
		if (rawValue instanceof Array) {
			return {
				name: '',
				type: BoxType.SerializedData,
				value: null,
				valueType: BoxValueType.Empty,
				children: rawValue.map((rawChild) => YamlImporter.serialize(rawChild)),
			};
		}
		if (rawValue instanceof Object) {
			const keys = Object.keys(rawValue);
			if (keys.length === 1) {
				return YamlImporter.serializeEntry(keys[0], (<Dict<unknown>>rawValue)[keys[0]]);
			}
			return {
				name: '',
				type: BoxType.SerializedData,
				value: null,
				valueType: BoxValueType.Empty,
				children: keys.map((key) => YamlImporter.serialize({
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

	static serializeEntry(key: string, rawValue: unknown): Box {
		if (rawValue instanceof Object) {
			return {
				name: key,
				type: BoxType.SerializedData,
				value: null,
				valueType: BoxValueType.Empty,
				children: Object.keys(rawValue).map((chKey) => YamlImporter.serialize(
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

	static getFuncName(rawFunc: Dict<unknown>) {
		const keys = Object.keys(rawFunc);
		if (keys.length === 0) {
			throw new YamlImporterError('function must have an attribute');
		}
		if (keys.length > 1) {
			throw new YamlImporterError('function attribute must be unique');
		}
		return keys[0];
	}

	static getFuncType(funcName: string): BoxType {
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

	static getValueType(rawValue: unknown): BoxValueType {
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
}

export default YamlImporter;
