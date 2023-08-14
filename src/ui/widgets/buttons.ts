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

export const PlayButton: Button = {
	id: 'play',
	label: 'Play',
	tooltip: 'Play/update tune (Ctrl-Enter)',
	onClick: defaultOnclick,
};

export const StopButton: Button = {
	id: 'stop',
	label: 'Stop',
	tooltip: 'Stop tune (Ctrl-.)',
	onClick: defaultOnclick,
};

export const WebsiteButton: Button = {
	id: 'website',
	label: 'Website',
	tooltip: 'Visit Jaffle website',
	onClick: () => { window.location.href = '/jaffle'; },
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
