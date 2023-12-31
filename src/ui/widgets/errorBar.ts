import { UndefError } from '../../errors';

export default class ErrorBar {
	private _dom?: HTMLParagraphElement;

	get dom() { return this._dom || (function t() { throw new UndefError(); }()); }

	build(domContainer: HTMLElement) {
		this._dom = document.createElement('p');

		this.dom.id = 'jaffle-error';
		this.dom.style.display = 'none';

		domContainer.appendChild(this.dom);
	}

	setError(text?: string): void {
		if (text === undefined) {
			this.dom.innerText = '';
			this.dom.style.display = 'none';
		} else {
			this.dom.innerText = text;
			this.dom.style.display = 'block';
		}
	}

	static getStyle(): CSSStyleSheet {
		const style = new CSSStyleSheet();
		style.replaceSync(`		
			#jaffle-error {
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
			}`);
		return style;
	}
}
