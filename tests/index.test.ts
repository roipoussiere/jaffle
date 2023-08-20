import { describe, test, expect } from '@jest/globals';

import { Editor, NodeEditor, YamlEditor, JsEditor } from '../src';

describe('Testing index', () => {
	test.skip('imports should not fail', () => {
		const editors = [new NodeEditor({}), new YamlEditor(), new JsEditor()];
		const editor = new Editor({}, editors, [], []);
		expect(editor.content.rawName).toBe('');
	});
});
