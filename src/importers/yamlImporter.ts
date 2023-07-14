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
			id: 0,
			groupId: 0,
			type: FuncType.Root,
			label: '',
			valueType: ValueType.Object,
			valueText: '',
			params: YamlImporter.computeParams(rawComposition),
		};
		return YamlImporter.upgradeTree(partialTree);
	}

	private static computeParams(rawParams: Array<unknown>): Params {
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

	private static computeList(rawList: Array<unknown>): FuncTree {
		const params = YamlImporter.computeParams(rawList);

		return {
			id: 0,
			groupId: 0,
			type: FuncType.List,
			label: '[]',
			valueType: ValueType.Object,
			valueText: '',
			params,
		};
	}

	private static computeFunc(rawFunc: Dict<unknown>): FuncTree {
		const funcName = YamlImporter.getFuncName(rawFunc);
		const rawValue = rawFunc[funcName];
		const valueType = YamlImporter.getValueType(rawValue);
		const params = YamlImporter.computeParams(rawValue instanceof Array ? rawValue : []);

		return {
			id: 0,
			groupId: 0,
			type: funcName[0] === c.CHAINED_FUNC_PREFIX ? FuncType.Chained : FuncType.Main,
			label: funcName,
			valueType,
			valueText: valueType === ValueType.Object ? '' : `${rawValue}`,
			params,
		};
	}

	private static computeLiteral(rawLiteral: unknown): FuncTree {
		if (typeof rawLiteral === 'string') {
			const stringFuncType = YamlImporter.getStringFuncType(rawLiteral);
			if (stringFuncType !== null) {
				return {
					id: 0,
					groupId: 0,
					type: stringFuncType,
					label: rawLiteral,
					valueType: ValueType.Object,
					valueText: '',
					params: [],
				};
			}
		}

		return {
			id: 0,
			groupId: 0,
			type: FuncType.Anon,
			label: '',
			valueType: YamlImporter.getValueType(rawLiteral),
			valueText: '',
			params: [],
		};
	}

	private static upgradeTree(tree: FuncTree, funcId = 0, groupId = 0): FuncTree {
		tree.params.map((func) => {
			const grouIdIncrement = func.type !== FuncType.Chained ? 1 : 0;
			return YamlImporter.upgradeTree(tree, funcId + 1, groupId + grouIdIncrement);
		});
		return tree;
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

	static getStringFuncType(funcName: string): FuncType | null {
		const prefix = funcName[0];
		const strFuncTypes: Dict<FuncType> = {
			[c.MINI_STR_PREFIX]: FuncType.Mininotation,
			[c.EXPR_STR_PREFIX]: FuncType.Expression,
			[c.CONST_FUNC_PREFIX]: FuncType.Constant,
		};
		return prefix in strFuncTypes ? strFuncTypes[prefix] : null;
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
			return ValueType.Object;
		}
		return ValueType.Null;
	}
}

export default YamlImporter;
