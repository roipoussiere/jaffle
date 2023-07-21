import { load as loadYaml } from 'js-yaml';

import { Vertex, VertexType } from '../dataTypes/vertex';
import * as c from '../constants';
import { Dict } from '../dataTypes/box';

import AbstractImporter from './abstractImporter';
import { YamlImporterError } from './importerErrors';

class YamlImporter extends AbstractImporter {
	public static import(yaml: string): Vertex {
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
			// name: '',
			type: VertexType.MainFunc,
			value: null,
			// valueType: VertexType.Tree,
			children: YamlImporter.computeParams(rawComposition),
		};
	}

	static computeParams(rawParams: Array<unknown>): Array<Vertex> {
		const params: Array<Vertex> = [];

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

	static computeList(rawList: Array<unknown>): Vertex {
		if (rawList.length === 0) {
			throw new YamlImporterError('list is empty');
		}

		return {
			// name: '',
			type: VertexType.MainFunc,
			value: null,
			// valueType: VertexType.Tree,
			children: YamlImporter.computeParams(rawList),
		};
	}

	static computeFunc(rawFunc: Dict<unknown>): Vertex {
		const funcName = YamlImporter.getFuncName(rawFunc);
		const funcType = YamlImporter.getFuncType(funcName);
		const rawValue = rawFunc[funcName];

		if (funcType === VertexType.SerializedData) {
			return YamlImporter.serialize(rawFunc);
		}

		return {
			// name: funcName,
			type: funcType,
			value: rawValue instanceof Array ? null : rawValue,
			// valueType: YamlImporter.getValueType(rawValue),
			children: rawValue instanceof Array ? YamlImporter.computeParams(rawValue) : [],
		};
	}

	static computeLiteral(rawLiteral: unknown): Vertex {
		if (typeof rawLiteral === 'string') {
			const stringFuncType = YamlImporter.getFuncType(rawLiteral);
			if ([VertexType.Mininotation, VertexType.Expression].includes(stringFuncType)) {
				return {
					// name: rawLiteral,
					type: stringFuncType,
					value: null,
					// valueType: VertexType.Empty,
					children: [],
				};
			}
		}

		return {
			// name: '',
			type: VertexType.Literal,
			value: rawLiteral,
			// valueType: YamlImporter.getValueType(rawLiteral),
			children: [],
		};
	}

	static serialize(rawValue: unknown): Vertex {
		if (rawValue instanceof Array) {
			return {
				// name: '',
				type: VertexType.SerializedData,
				value: null,
				// valueType: VertexType.Tree,
				children: rawValue.map((rawChild) => YamlImporter.serialize(rawChild)),
			};
		}
		if (rawValue instanceof Object) {
			const keys = Object.keys(rawValue);
			if (keys.length === 1) {
				return YamlImporter.serializeEntry(keys[0], (<Dict<unknown>>rawValue)[keys[0]]);
			}
			return {
				// name: '',
				type: VertexType.SerializedData,
				value: null,
				// valueType: VertexType.Tree,
				children: keys.map((key) => YamlImporter.serialize({
					[key]: (<Dict<unknown>>rawValue)[key],
				})),
			};
		}
		return {
			// name: '',
			type: VertexType.SerializedData,
			value: rawValue,
			// valueType: VertexType.Literal,
			children: [],
		};
	}

	static serializeEntry(key: string, rawValue: unknown): Vertex {
		if (rawValue instanceof Object) {
			return {
				// name: key,
				type: VertexType.SerializedData,
				value: null,
				// valueType: VertexType.Tree,
				children: Object.keys(rawValue).map((chKey) => YamlImporter.serialize(
					rawValue instanceof Array ? rawValue[Number(chKey)] : {
						[chKey]: (<Dict<unknown>>rawValue)[chKey],
					},
				)),
			};
		}
		return {
			// name: key,
			type: VertexType.SerializedData,
			value: rawValue,
			// valueType: VertexType.Literal,
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

	static getFuncType(funcName: string): VertexType {
		const prefix = funcName[0];
		const funcTypes: Dict<VertexType> = {
			[c.CHAINED_FUNC_PREFIX]: VertexType.ChainedFunc,
			[c.MINI_STR_PREFIX]: VertexType.Mininotation,
			[c.EXPR_STR_PREFIX]: VertexType.Expression,
			[c.CONST_FUNC_PREFIX]: VertexType.ConstantDef,
		};
		if (prefix in funcTypes) {
			return funcTypes[prefix];
		}
		if (funcName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
			return VertexType.SerializedData;
		}
		return VertexType.MainFunc;
	}

	static getValueType(rawValue: unknown): VertexType {
		if (typeof rawValue === 'string') {
			if (rawValue[0] === c.MINI_STR_PREFIX) {
				return VertexType.Mininotation;
			}
			if (rawValue[0] === c.EXPR_STR_PREFIX) {
				return VertexType.Expression;
			}
		}
		// if (rawValue instanceof Object) {
		// 	return VertexType.Tree;
		// }
		return VertexType.Literal;
	}
}

export default YamlImporter;
