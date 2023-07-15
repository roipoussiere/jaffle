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

		const partialTree = {
			id: -1,
			groupId: -1,
			type: FuncType.Root,
			label: '',
			valueType: ValueType.Tree,
			valueText: '',
			params: YamlImporter.computeParams(rawComposition),
		};
		return YamlImporter.upgradeTree(partialTree);
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
			id: -1,
			groupId: -1,
			type: FuncType.List,
			label: '[]',
			valueType: ValueType.Tree,
			valueText: '',
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

		const valueType = YamlImporter.getValueType(rawValue);

		let valueText: string;
		if (valueType === ValueType.Tree) {
			valueText = '';
		} else if (rawValue === null) {
			valueText = '∅';
		} else {
			valueText = `${rawValue}`;
		}

		return {
			id: -1,
			groupId: -1,
			type: funcType,
			label: funcName,
			valueType,
			valueText,
			params: rawValue instanceof Array ? YamlImporter.computeParams(rawValue) : [],
		};
	}

	static computeLiteral(rawLiteral: unknown): FuncTree {
		if (typeof rawLiteral === 'string') {
			const stringFuncType = YamlImporter.getFuncType(rawLiteral);
			if ([FuncType.MainMininotation, FuncType.MainExpression].includes(stringFuncType)) {
				return {
					id: -1,
					groupId: -1,
					type: stringFuncType,
					label: rawLiteral,
					valueType: ValueType.Empty,
					valueText: '',
					params: [],
				};
			}
		}

		return {
			id: -1,
			groupId: -1,
			type: FuncType.LiteralValue,
			label: '',
			valueType: YamlImporter.getValueType(rawLiteral),
			valueText: rawLiteral === null ? '∅' : `${rawLiteral}`,
			params: [],
		};
	}

	static upgradeTree(tree: FuncTree, funcId = 0, groupId = 0): FuncTree {
		let paramsGroupId = -1;
		return {
			...tree,
			id: funcId,
			groupId,
			params: tree.params.map((param, i) => {
				if (param.type !== FuncType.Chained) {
					paramsGroupId += 1;
				}
				return YamlImporter.upgradeTree(
					param,
					funcId + i + 1,
					paramsGroupId,
				);
			}),
		};
	}

	static serialize(rawValue: unknown): FuncTree {
		if (typeof rawValue === 'string') {
			return {
				id: -1,
				groupId: -1,
				type: FuncType.Serialized,
				label: '',
				valueType: ValueType.String,
				valueText: rawValue,
				params: [],
			};
		}
		if (typeof rawValue === 'number') {
			return {
				id: -1,
				groupId: -1,
				type: FuncType.Serialized,
				label: '',
				valueType: ValueType.Number,
				valueText: `${rawValue}`,
				params: [],
			};
		}
		if (rawValue instanceof Array) {
			return {
				id: -1,
				groupId: -1,
				type: FuncType.Serialized,
				label: '[]',
				valueType: ValueType.Tree,
				valueText: '',
				params: rawValue.map((rawChild) => YamlImporter.serialize(rawChild)),
			};
		}
		if (rawValue instanceof Object) {
			const keys = Object.keys(rawValue);
			if (keys.length === 1) {
				return YamlImporter.serializeEntry(keys[0], (<Dict<unknown>>rawValue)[keys[0]]);
			}
			return {
				id: -1,
				groupId: -1,
				type: FuncType.Serialized,
				label: '{}',
				valueType: ValueType.Tree,
				valueText: '',
				params: keys.map((key) => YamlImporter.serialize({
					[key]: (<Dict<unknown>>rawValue)[key],
				})),
			};
		}
		return {
			id: -1,
			groupId: -1,
			type: FuncType.Serialized,
			label: '',
			valueType: ValueType.Null,
			valueText: '∅',
			params: [],
		};
	}

	static serializeEntry(key: string, rawValue: unknown): FuncTree {
		if (rawValue instanceof Object) {
			return {
				id: -1,
				groupId: -1,
				type: FuncType.Serialized,
				label: key,
				valueType: ValueType.Tree,
				valueText: '',
				params: Object.keys(rawValue).map((chKey) => YamlImporter.serialize(
					rawValue instanceof Array ? rawValue[Number(chKey)] : {
						[chKey]: (<Dict<unknown>>rawValue)[chKey],
					},
				)),
			};
		}
		if (typeof rawValue === 'string') {
			return {
				id: -1,
				groupId: -1,
				type: FuncType.Serialized,
				label: key,
				valueType: ValueType.String,
				valueText: rawValue,
				params: [],
			};
		}
		if (typeof rawValue === 'number') {
			return {
				id: -1,
				groupId: -1,
				type: FuncType.Serialized,
				label: key,
				valueType: ValueType.Number,
				valueText: `${rawValue}`,
				params: [],
			};
		}
		return {
			id: -1,
			groupId: -1,
			type: FuncType.Serialized,
			label: key,
			valueType: ValueType.Null,
			valueText: '∅',
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
