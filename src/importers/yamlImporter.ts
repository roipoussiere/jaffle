/* eslint-disable max-classes-per-file */
import { load as loadYaml } from 'js-yaml';

// eslint-disable-next-line object-curly-newline
import { Params, FuncTree, FuncType, ValueType } from '../funcTree';
import { ImporterError } from '../errors';
import * as c from '../constants';

import AbstractImporter from './abstractImporter';

interface Dict<T> {
	[key: string]: T;
}

export class YamlImporterError extends ImporterError {
	constructor(message: string) {
		super(message);
		this.name = YamlImporterError.name;
	}
}

export class YamlImporter extends AbstractImporter {
	public static import(yaml: string): FuncTree {
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
			type: FuncType.Main,
			value: '',
			valueType: ValueType.Tree,
			params: YamlImporter.computeParams(rawComposition),
		};
	}

	static computeParams(rawParams: Array<unknown>): Params {
		const params: Params = [];

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

	static computeList(rawList: Array<unknown>): FuncTree {
		if (rawList.length === 0) {
			throw new YamlImporterError('list is empty');
		}

		return {
			type: FuncType.List,
			name: '',
			value: '',
			valueType: ValueType.Tree,
			params: YamlImporter.computeParams(rawList),
		};
	}

	static computeFunc(rawFunc: Dict<unknown>): FuncTree {
		const funcName = YamlImporter.getFuncName(rawFunc);
		const funcType = YamlImporter.getFuncType(funcName);
		const rawValue = rawFunc[funcName];

		if (funcType === FuncType.Serialized) {
			return YamlImporter.serialize(rawFunc);
		}

		return {
			name: funcName,
			type: funcType,
			value: rawValue instanceof Array ? '' : rawValue,
			valueType: YamlImporter.getValueType(rawValue),
			params: rawValue instanceof Array ? YamlImporter.computeParams(rawValue) : [],
		};
	}

	static computeLiteral(rawLiteral: unknown): FuncTree {
		if (typeof rawLiteral === 'string') {
			const stringFuncType = YamlImporter.getFuncType(rawLiteral);
			if ([FuncType.MainMininotation, FuncType.MainExpression].includes(stringFuncType)) {
				return {
					name: rawLiteral,
					type: stringFuncType,
					value: '',
					valueType: ValueType.Empty,
					params: [],
				};
			}
		}

		return {
			name: '',
			type: FuncType.Literal,
			value: rawLiteral,
			valueType: YamlImporter.getValueType(rawLiteral),
			params: [],
		};
	}

	static serialize(rawValue: unknown): FuncTree {
		if (typeof rawValue === 'string') {
			return {
				name: '',
				type: FuncType.Serialized,
				value: rawValue,
				valueType: ValueType.String,
				params: [],
			};
		}
		if (typeof rawValue === 'number') {
			return {
				name: '',
				type: FuncType.Serialized,
				value: rawValue,
				valueType: ValueType.Number,
				params: [],
			};
		}
		if (rawValue instanceof Array) {
			return {
				name: '',
				type: FuncType.Serialized,
				value: '',
				valueType: ValueType.Tree,
				params: rawValue.map((rawChild) => YamlImporter.serialize(rawChild)),
			};
		}
		if (rawValue instanceof Object) {
			const keys = Object.keys(rawValue);
			if (keys.length === 1) {
				return YamlImporter.serializeEntry(keys[0], (<Dict<unknown>>rawValue)[keys[0]]);
			}
			return {
				name: '',
				type: FuncType.Serialized,
				value: '',
				valueType: ValueType.Tree,
				params: keys.map((key) => YamlImporter.serialize({
					[key]: (<Dict<unknown>>rawValue)[key],
				})),
			};
		}
		return {
			name: '',
			type: FuncType.Serialized,
			value: null,
			valueType: ValueType.Null,
			params: [],
		};
	}

	static serializeEntry(key: string, rawValue: unknown): FuncTree {
		if (rawValue instanceof Object) {
			return {
				name: key,
				type: FuncType.Serialized,
				value: '',
				valueType: ValueType.Tree,
				params: Object.keys(rawValue).map((chKey) => YamlImporter.serialize(
					rawValue instanceof Array ? rawValue[Number(chKey)] : {
						[chKey]: (<Dict<unknown>>rawValue)[chKey],
					},
				)),
			};
		}
		if (typeof rawValue === 'string') {
			return {
				name: key,
				type: FuncType.Serialized,
				value: rawValue,
				valueType: ValueType.String,
				params: [],
			};
		}
		if (typeof rawValue === 'number') {
			return {
				name: key,
				type: FuncType.Serialized,
				value: rawValue,
				valueType: ValueType.Number,
				params: [],
			};
		}
		return {
			name: key,
			type: FuncType.Serialized,
			value: null,
			valueType: ValueType.Null,
			params: [],
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

	static getFuncType(funcName: string): FuncType {
		const prefix = funcName[0];
		const funcTypes: Dict<FuncType> = {
			[c.CHAINED_FUNC_PREFIX]: FuncType.Chained,
			[c.MINI_STR_PREFIX]: FuncType.MainMininotation,
			[c.EXPR_STR_PREFIX]: FuncType.MainExpression,
			[c.CONST_FUNC_PREFIX]: FuncType.Constant,
		};
		if (prefix in funcTypes) {
			return funcTypes[prefix];
		}
		if (funcName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
			return FuncType.Serialized;
		}
		return FuncType.Main;
	}

	static getValueType(rawValue: unknown): ValueType {
		if (typeof rawValue === 'string') {
			const prefix = rawValue[0];
			if (prefix === c.MINI_STR_PREFIX) {
				return ValueType.Mininotation;
			}
			if (prefix === c.EXPR_STR_PREFIX) {
				return ValueType.Expression;
			}
			return ValueType.String;
		}
		if (typeof rawValue === 'number') {
			return ValueType.Number;
		}
		if (rawValue instanceof Object) {
			return ValueType.Tree;
		}
		return ValueType.Null;
	}
}

export default YamlImporter;
