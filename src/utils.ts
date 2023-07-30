/* eslint-disable import/prefer-default-export */
import { Entry, EntryType } from './model';
import * as c from './constants';

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
