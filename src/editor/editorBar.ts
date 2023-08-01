type OnClick = () => void;

export type Button = {
	id: string,
	label: string,
	tooltip: string,
	onClick: OnClick,
}

export type Tab = {
	id: string,
	label: string,
	tooltip: string,
	onClick: OnClick,
}

export class EditorBar {
	dom: HTMLElement;

	domTitle: HTMLParagraphElement;

	buttons: Array<Button>;

	tabs: Array<Tab>;

	title: string;

	constructor(title: string, tabs: Array<Tab>, buttons: Array<Button>) {
		this.title = title;
		this.tabs = tabs;
		this.buttons = buttons;
	}

	build(container: HTMLElement) {
		this.dom = document.createElement('div');
		this.dom.id = 'jaffle-editor-bar';

		this.buildTitle();
		this.tabs.forEach((tab) => this.buildTab(tab));
		this.buttons.forEach((button) => this.buildButton(button));

		container.appendChild(this.dom);
	}

	setTitle(title: string): void {
		this.title = title;
		this.domTitle.innerText = title;
	}

	private buildTitle(): void {
		this.domTitle = document.createElement('p');
		this.domTitle.id = 'jaffle-title';
		this.domTitle.innerText = this.title;

		this.dom.appendChild(this.domTitle);
	}

	private buildTab(tab: Tab): void {
		const domtab = document.createElement('button');

		domtab.id = `jaffle-tab-${tab.id}`;
		domtab.className = 'jaffle-tab';
		domtab.title = tab.tooltip;
		domtab.innerText = tab.label;
		domtab.addEventListener('click', tab.onClick);

		this.dom.appendChild(domtab);
	}

	private buildButton(button: Button): void {
		const domButton = document.createElement('button');

		domButton.id = `jaffle-btn-${button.id}`;
		domButton.className = 'jaffle-btn';
		domButton.title = button.tooltip;
		domButton.innerText = button.label;
		domButton.addEventListener('click', button.onClick);

		this.dom.appendChild(domButton);
	}

	static getStyle(): CSSStyleSheet {
		const style = new CSSStyleSheet();
		style.replaceSync(`		
			#jaffle-editor-bar {
				position: absolute;
				width: 100%;
				top: 0px;
				background-color: #0A813F;
				z-index: 6;
				height: 35px;
			}
	
			#jaffle-title {
				position: absolute;
				text-align: center;
				color: darkseagreen;
				left: 45%;
				width: 10%;
				margin-top: 9px;
				font-weight: bold;
				z-index: 0;
			}

			.jaffle-tab {
				margin: 0;
				margin-right: 5px;
				cursor: pointer;
				width: 4em;
				height: 35px;
				float: left;
				background-color: transparent;
				border: none;
				color: white;
				text-shadow: 1px 1px 2px black;
				font-weight: bold;
			}

			.jaffle-tab:hover {
				background-color: cadetblue;
			}

			.jaffle-btn {
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
	
			.jaffle-btn:hover {
				background-color: cadetblue;
			}`);
		return style;
	}
}

export default EditorBar;
