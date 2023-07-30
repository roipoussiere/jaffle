/* eslint-disable import/prefer-default-export */
import { Entry, EntryType } from './model';
import * as c from './constants';
import { ExporterError } from './errors';

export function entryToEntryType(entry: Entry): EntryType {
	if (entry.rawName === '' && entry.rawValue === '') {
		return EntryType.List;
	}
	if (entry.rawName[0] === c.CONSTANT_DEF_PREFIX) {
		return EntryType.ConstantDef;
	}
	if (entry.rawName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		return EntryType.SerializedData;
	}
	if (entry.rawName === '') {
		return entry.rawValue[0] === c.MINI_STR_PREFIX ? EntryType.Function : EntryType.Value;
	}
	if (entry.rawName[0] === c.CHAINED_FUNC_PREFIX) {
		return EntryType.ChainedFunction;
	}
	if (entry.rawName[0] === entry.rawName[0].toUpperCase()) {
		return EntryType.Object;
	}
	if (entry.rawName === c.LAMBDA_NAME) {
		return EntryType.LambdaFunction;
	}
	return EntryType.Function;
}

export function entryToFuncName(entry: Entry): string {
	if (entry.rawName === '') {
		throw new ExporterError('can not get func name from empty raw name');
	}
	if (entry.rawName[0] === c.CHAINED_FUNC_PREFIX || entry.rawName[0] === c.CONSTANT_DEF_PREFIX) {
		return entry.rawName.substring(1);
	}
	if (entry.rawName.slice(-1) === c.SERIALIZE_FUNC_SUFFIX) {
		return entry.rawName.substring(0, entry.rawName.length - 1);
	}
	if (entry.rawName[0] === entry.rawName[0].toUpperCase()) {
		return entry.rawName[0].toLowerCase() + entry.rawName.substring(1);
	}
	return entry.rawName;
}
