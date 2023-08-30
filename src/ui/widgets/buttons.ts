export type Button = {
	id: string,
	label: string,
	tooltip: string,
	onClick: () => void,
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
	- Ctrl + shift + z: redo`),
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
