import { OnPlay, OnStop } from './editor';

export function buildTopBar(onPlay: OnPlay, onStop: OnStop): HTMLDivElement {
	const domTitle = document.createElement('p');
	domTitle.id = 'jaffle_title';
	domTitle.innerText = 'Jaffle - live coding in Yaml';

	const domBtnStart = document.createElement('button');
	domBtnStart.id = 'jaffle_play';
	domBtnStart.className = 'jaffle_btn';
	domBtnStart.title = 'Play/update tune (Ctrl-Enter)';
	domBtnStart.innerText = 'Play';
	domBtnStart.addEventListener('click', onPlay);

	const domBtnStop = document.createElement('button');
	domBtnStop.id = 'jaffle_stop';
	domBtnStop.className = 'jaffle_btn';
	domBtnStop.title = 'Stop tune (Ctrl-.)';
	domBtnStop.innerText = 'Stop';
	domBtnStop.addEventListener('click', onStop);

	const domTopBar = document.createElement('div');
	domTopBar.id = 'jaffle_topbar';
	domTopBar.appendChild(domTitle);
	domTopBar.appendChild(domBtnStop);
	domTopBar.appendChild(domBtnStart);

	return domTopBar;
}

export function getStyleSheet(): string {
	return `
		#jaffle_topbar {
			position: absolute;
			width: 100%;
			top: 0px;
			background-color: #0A813F;
			z-index: 6;
			height: 35px;
		}

		#jaffle_title {
			position: absolute;
			color: darkseagreen;
			margin: 9px;
			font-weight: bold;
		}

		.jaffle_btn {
			margin: 0;
			margin-left: 5px;
			cursor: pointer;
			width: 4em;
			height: 35px;
			float: right;
			background-color: darkseagreen;
			border: none;
			color: white;
			text-shadow: 1px 1px 2px black;
			font-weight: bold;
		}

		.jaffle_btn:hover {
			background-color: cadetblue;
		}`;
}
