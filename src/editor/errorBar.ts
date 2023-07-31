export function buildErrorBar(): HTMLParagraphElement {
	const domErrorBar = document.createElement('p');
	domErrorBar.id = 'jaffle_error';
	domErrorBar.style.display = 'none';

	return domErrorBar;
}

export function getErrorBarCSS(): string {
	return `		
		#jaffle_error {
			display: block;
			position: absolute;
			bottom: 0;
			width: 92%;
			margin: 2%;
			padding: 2%;
			overflow: auto;
			max-height: 33%;
			background-color: darksalmon;
			border-radius: 3px;
			box-shadow: 0 0 7px black;
		}`;
}
