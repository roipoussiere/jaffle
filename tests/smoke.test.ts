import { describe, test } from '@jest/globals';

import tunes from '../src/tunes/_tuneIndex';
import yamlToEntry from '../src/transpilers/yaml/yamlImporter';
import entryToYaml from '../src/transpilers/yaml/yamlExporter';
import boxToEntry from '../src/transpilers/graph/graphImporter';
import entryToBox from '../src/transpilers/graph/graphExporter';
import entryToJs from '../src/transpilers/js/jsExporter';
import { Entry } from '../src/model';
import { Box } from '../src/transpilers/graph/graphModel';

describe('Testing tunes', () => {
	Object.keys(tunes).forEach((tuneName) => {
		let entry: Entry;
		let yaml: string;
		let box: Box;
		// TODO: check js with acorn

		test(`${tuneName}: load`, () => { entry = yamlToEntry(tunes[tuneName]); });

		test(`${tuneName}: js/dump`, () => { entryToJs(entry); });
		// test(`${tuneName}: js/check`, () => { acorn(js); });

		test(`${tuneName}: yaml/dump`, () => { yaml = entryToYaml(entry); });
		test(`${tuneName}: yaml/load`, () => { entry = yamlToEntry(yaml); });
		test(`${tuneName}: yaml/check`, () => { /* acorn( */ entryToJs(entry); });

		test(`${tuneName}: box/dump`, () => { box = entryToBox(entry); });
		test(`${tuneName}: box/load`, () => { entry = boxToEntry(box); });
		test(`${tuneName}: box/check`, () => { /* acorn( */ entryToJs(entry); });
	});
});
