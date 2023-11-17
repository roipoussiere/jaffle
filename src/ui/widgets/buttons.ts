export type Link = {
	label: string,
	url: string,
}

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
	onClick: () => alert(`Global:
	- Ctrl + 1/2/3: focus tab

Node editor:
	- Enter: edit / validate
	- Up/down: move cursor to previous/next box
	- Left/right: move cursor to parent/child box
	- Ctrl + up/down: scroll vertically
	- Ctrl + left/right: scroll horizontally
	- Shift + up/down: add box above/below
	- Tab: new box child
	- Delete: clear box key/value
	- Ctrl + delete: remove box
	- Ctrl + shift + n : clear all

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

export function buildLinksCloud(id: string, links: Array<Link>): HTMLDivElement {
	const domButtonsCloud = document.createElement('div');
	domButtonsCloud.id = id;
	domButtonsCloud.style.cssText = `
display: none;
position: absolute;
max-width: 70%;
top: 67px;
right: 15%;
background-color: #002b36;
padding: 3px;
padding-bottom: 0;
padding-left: 0;`;

	links.forEach((link) => {
		const domButton = document.createElement('p');
		domButton.innerText = link.label;
		domButton.addEventListener('click', () => { window.location.href = link.url; });
		domButton.addEventListener('mouseover', () => {
			domButton.style.backgroundColor = 'cadetblue';
		});
		domButton.addEventListener('mouseout', () => {
			domButton.style.backgroundColor = 'darkseagreen';
		});
		domButton.style.cssText = `
display: inline-block;
float: left;
background-color: darkseagreen;
border: none;
margin: 0;
padding: 5px;
margin-left: 3px;
margin-bottom: 3px;
cursor: pointer;`;
		domButtonsCloud.appendChild(domButton);
	});

	return domButtonsCloud;
}
