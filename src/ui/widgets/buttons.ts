import { JaffleError } from '../../errors';

type OnButtonClick = () => void;

const defaultOnclick = () => {
	throw new JaffleError('no action assigned to this button');
};

export type Button = {
	id: string,
	label: string,
	tooltip: string,
	onClick: OnButtonClick,
};

export const PlayBtn: Button = {
	id: 'play',
	label: 'Play',
	tooltip: 'Play/update tune (Ctrl-Enter)',
	onClick: defaultOnclick,
};

export const StopBtn: Button = {
	id: 'stop',
	label: 'Stop',
	tooltip: 'Stop tune (Ctrl-.)',
	onClick: defaultOnclick,
};

export const WebsiteBtn: Button = {
	id: 'website',
	label: 'Website',
	tooltip: 'Visit Jaffle website',
	onClick: () => { window.location.href = '/jaffle'; },
};

export const ShortcutsBtn: Button = {
	id: 'shortcuts',
	label: 'Shortcuts',
	tooltip: 'Display keyboard shortcuts',
	// eslint-disable-next-line no-alert
	onClick: () => alert(`Node editor:
- Enter: edit / validate
- Up/down: move cursor to previous/next box
- Left/right: move cursor to parent/child box
- Ctrl + up/down: scroll vertically
- Ctrl + left/right: scroll horizontally
- Shift + up/down: add box above/below
- Tab: new box child
- Delete: clear box key/value
- Ctrl + delete: remove box
Text editor (Yaml/JS):
- Ctrl + z: undo
- Ctr + shift + z: redo`),
};

export const AboutBtn: Button = {
	id: 'about',
	label: 'About',
	tooltip: 'Display project credits and license information',
	// eslint-disable-next-line no-alert
	onClick: () => alert(`Jaffle (editors, transpilers, website):
	- credits: Nathanaël Jourdane and contributors
	- license: AGPL-3.0 (https://www.gnu.org/licenses/agpl-3.0.txt)
	- source: https://github.com/roipoussiere/jaffle

Strudel (music code interpreter):
	- credits: Strudel contributors
	- license: AGPL-3.0 (https://www.gnu.org/licenses/agpl-3.0.txt)
	- source: https://github.com/tidalcycles/strudel

Pre-loaded sounds
	- piano:
	  - credits: Alexander Holm
	  - license: CC-by (http://creativecommons.org/licenses/by/3.0)
	  - source: https://archive.org/details/SalamanderGrandPianoV3
	- VCSL:
	  - credits: Versilian Studios LLC
	  - license: CC0 (https://creativecommons.org/publicdomain/zero/1.0/)
	  - source: https://github.com/sgossner/VCSL
	- Tidal drum machines:
	  - source: https://github.com/ritchse/tidal-drum-machines
	- EmuSP12:
	  - source: https://github.com/tidalcycles/Dirt-Samples
`),
};

export function buildButton(button: Button): HTMLButtonElement {
	const domButton = document.createElement('button');

	domButton.id = `jaffle-btn-${button.id}`;
	domButton.className = 'jaffle-btn';
	domButton.title = button.tooltip;
	domButton.innerText = button.label;
	domButton.addEventListener('click', button.onClick);

	return domButton;
}
