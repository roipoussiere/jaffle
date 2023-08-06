import { load as loadYaml } from 'js-yaml';

import * as c from '../../constants';
import { Entry, Dict } from '../../model';

import { ImporterError } from '../../errors';

export function getEntryName(rawFunc: Dict<unknown>) {
	const keys = Object.keys(rawFunc);
	if (keys.length === 0) {
		throw new ImporterError('function must have an attribute');
	}
	if (keys.length > 1) {
		throw new ImporterError('function attribute must be unique');
	}
	return keys[0];
}

export function keyValToSerializedEntry(key: string, rawValue: unknown): Entry {
	if (rawValue instanceof Object) {
		return {
			rawName: key,
			rawValue: '',
			// eslint-disable-next-line no-use-before-define
			children: Object.keys(rawValue).map((chKey) => valueToSerializedEntry(
				rawValue instanceof Array ? rawValue[Number(chKey)] : {
					[chKey]: (<Dict<unknown>>rawValue)[chKey],
				},
			)),
		};
	}
	return {
		rawName: key,
		rawValue: rawValue === null ? '' : `${rawValue}`,
		children: [],
	};
}

export function valueToSerializedEntry(rawValue: unknown): Entry {
	if (rawValue instanceof Array) {
		return {
			rawName: '',
			rawValue: '',
			children: rawValue.map((rawChild) => valueToSerializedEntry(rawChild)),
		};
	}
	if (rawValue instanceof Object) {
		const keys = Object.keys(rawValue);
		if (keys.length === 1) {
			return keyValToSerializedEntry(keys[0], (<Dict<unknown>>rawValue)[keys[0]]);
		}
		return {
			rawName: '',
			rawValue: '',
			children: keys.map((key) => valueToSerializedEntry({
				[key]: (<Dict<unknown>>rawValue)[key],
			})),
		};
	}
	return {
		rawName: '',
		rawValue: rawValue === null ? '' : `${rawValue}`,
		children: [],
	};
}

export function buildLiteralEntry(rawLiteral: unknown): Entry {
	return {
		rawName: '',
		rawValue: rawLiteral === null ? '' : `${rawLiteral}`,
		children: [],
	};
}

export function buildListEntry(rawList: Array<unknown>): Entry {
	if (rawList.length === 0) {
		throw new ImporterError('list is empty');
	}

	return {
		rawName: '',
		rawValue: '',
		// eslint-disable-next-line no-use-before-define
		children: buildEntryChildren(rawList),
	};
}

export function buildFuncEntry(rawFunc: Dict<unknown>): Entry {
	const boxName = getEntryName(rawFunc);
	const rawValue = rawFunc[boxName];

	if (boxName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		return valueToSerializedEntry(rawFunc);
	}

	if (rawValue instanceof Array) {
		return {
			rawName: boxName,
			rawValue: '',
			// eslint-disable-next-line no-use-before-define
			children: buildEntryChildren(rawValue),
		};
	}
	return {
		rawName: boxName,
		rawValue: rawValue === null ? '' : `${rawValue}`,
		children: [],
	};
}

export function buildEntryChildren(rawBoxChildren: Array<unknown>): Array<Entry> {
	const children: Array<Entry> = [];

	rawBoxChildren.forEach((child: unknown) => {
		if (child instanceof Array) {
			children.push(buildListEntry(child));
		} else if (child instanceof Object) {
			children.push(buildFuncEntry(<Dict<unknown>>child));
		} else {
			children.push(buildLiteralEntry(child));
		}
	});

	return children;
}

export function yamlToEntry(yaml: string): Entry {
	let data: unknown;

	try {
		data = loadYaml(yaml);
	} catch (err) {
		throw new ImporterError(`can not parse yaml: ${err.message}`);
	}

	if (!(data instanceof Array)) {
		throw new ImporterError('yaml root element must be an array');
	}
	const composition = <Array<unknown>> data;

	return {
		rawName: 'root',
		rawValue: '',
		children: buildEntryChildren(composition),
	};
}

export default yamlToEntry;
