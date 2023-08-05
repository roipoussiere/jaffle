type OnButtonClick = () => void;
type OnTabSwitch = (oldTabId: string, newTabId: string) => void;
type OnExampleSelected = (example: string) => void;

export type Tab = {
	id: string,
	label: string,
	tooltip: string,
};

export type Button = {
	id: string,
	label: string,
	tooltip: string,
	onClick: OnButtonClick,
};

export type MenuItem = {
	id: string,
	label: string,
	onClick: OnButtonClick,
};

export class EditorBar {
	title: string;

	tabs: Array<Tab>;

	buttons: Array<Button>;

	menu: Array<MenuItem>;

	activeTabId: string;

	onTabSwitch: OnTabSwitch;

	dom: HTMLElement;

	domTitle: HTMLParagraphElement;

	domTabs: { [key: string]: HTMLButtonElement };

	domExamplesMenu: HTMLDivElement;

	domMenu: HTMLDivElement;

	examplesTimer: NodeJS.Timeout;

	menuTimer: NodeJS.Timeout;

	examples: Array<string>;

	onExampleSelected: OnExampleSelected;

	constructor(
		title: string,
		tabs: Array<Tab>,
		buttons: Array<Button>,
		menu: Array<MenuItem>,
		examples: Array<string>,
		onExampleSelected: OnExampleSelected,
		activeTabId?: string,
	) {
		this.title = title;
		this.tabs = tabs;
		this.buttons = buttons;
		this.menu = menu;
		this.examples = examples;
		this.onExampleSelected = onExampleSelected;
		this.activeTabId = activeTabId || this.tabs[0].id;

		this.dom = new HTMLElement();
		this.domTitle = new HTMLParagraphElement();
		this.domExamplesMenu = new HTMLDivElement();
		this.domMenu = new HTMLDivElement();
		this.menuTimer = new NodeJS.Timeout();
		this.examplesTimer = new NodeJS.Timeout();

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		this.onTabSwitch = () => {};
		this.domTabs = {};
	}

	build(domContainer: HTMLElement) {
		this.dom = document.createElement('div');
		this.dom.id = 'jaffle-editor-bar';

		this.buildTitle();
		this.tabs.forEach((tab) => this.buildTab(tab));
		this.buildMenu();
		this.buttons.reverse().forEach((button) => this.buildButton(button));
		if (this.examples.length > 1) {
			this.buildExamplesMenu();
		}
		domContainer.appendChild(this.dom);
	}

	setTitle(title: string): void {
		this.title = title;
		this.domTitle.innerText = title;
	}

	private switchTab(newActiveTabId: string): void {
		this.domTabs[this.activeTabId].classList.remove('jaffle-tab-active');
		this.domTabs[newActiveTabId].classList.add('jaffle-tab-active');
		this.onTabSwitch(this.activeTabId, newActiveTabId);
		this.activeTabId = newActiveTabId;
	}

	private buildTitle(): void {
		this.domTitle = document.createElement('p');
		this.domTitle.id = 'jaffle-title';
		this.domTitle.innerText = this.title;

		this.dom.appendChild(this.domTitle);
	}

	private buildTab(tab: Tab): void {
		const domTab = document.createElement('button');

		domTab.id = `jaffle-tab-${tab.id}`;
		domTab.classList.add('jaffle-tab');
		if (tab.id === this.activeTabId) {
			domTab.classList.add('jaffle-tab-active');
		}

		domTab.title = tab.tooltip;
		domTab.innerText = tab.label;
		domTab.addEventListener('click', () => {
			if (tab.id !== this.activeTabId) {
				this.switchTab(tab.id);
			}
		});

		this.domTabs[tab.id] = domTab;
		this.dom.appendChild(domTab);
	}

	private buildMenu(): void {
		this.domMenu = document.createElement('div');

		const onMouseOut = () => {
			this.menuTimer = setTimeout(() => {
				this.domMenu.style.display = 'none';
			}, 200);
		};

		this.domMenu.id = 'jaffle-menu';
		this.domMenu.addEventListener('mouseover', () => clearTimeout(this.menuTimer));
		this.domMenu.addEventListener('mouseout', () => onMouseOut());
		this.menu.forEach((item) => this.domMenu.appendChild(EditorBar.buildMenuItem(item)));
		this.dom.appendChild(this.domMenu);

		const domMenuItemExamples = document.createElement('p');
		domMenuItemExamples.id = 'jaffle-menu-item-examples';
		domMenuItemExamples.className = 'jaffle-menu-item';
		domMenuItemExamples.innerText = 'Load example';
		domMenuItemExamples.addEventListener('mouseover', () => {
			clearTimeout(this.menuTimer);
			this.domExamplesMenu.style.display = 'block';
		});
		domMenuItemExamples.addEventListener('mouseout', () => {
			this.examplesTimer = setTimeout(() => {
				// eslint-disable-next-line no-param-reassign
				this.domExamplesMenu.style.display = 'none';
			}, 200);
		});
		this.domMenu.appendChild(domMenuItemExamples);

		const domMenuButton = document.createElement('button');
		domMenuButton.id = 'jaffle-menu-btn';
		domMenuButton.className = 'jaffle-btn';
		domMenuButton.innerText = '≡';
		domMenuButton.addEventListener('mouseover', () => {
			clearTimeout(this.menuTimer);
			this.domMenu.style.display = 'block';
		});
		domMenuButton.addEventListener('mouseout', () => onMouseOut());
		this.dom.appendChild(domMenuButton);
	}

	private static buildMenuItem(item: MenuItem): HTMLParagraphElement {
		const domMenuItem = document.createElement('p');
		domMenuItem.id = `jaffle-menu-item-${item.id}`;
		domMenuItem.className = 'jaffle-menu-item';
		domMenuItem.innerText = item.label;
		domMenuItem.addEventListener('click', item.onClick);
		return domMenuItem;
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

	private buildExamplesMenu(): void {
		this.domExamplesMenu = document.createElement('div');
		this.domExamplesMenu.id = 'jaffle-examples-menu';

		// const domButtons: Array<HTMLButtonElement> = [];
		this.examples.forEach((tune) => {
			const domButton = document.createElement('p');
			domButton.className = 'jaffle-example-btn';
			domButton.innerText = tune;
			domButton.addEventListener('mouseover', () => {
				clearTimeout(this.examplesTimer);
				clearTimeout(this.menuTimer);
			});
			domButton.addEventListener('mouseout', () => {
				this.examplesTimer = setTimeout(() => {
					this.domExamplesMenu.style.display = 'none';
					this.domMenu.style.display = 'none';
				}, 200);
			});
			domButton.addEventListener('click', () => {
				this.onExampleSelected(tune);
			});

			this.domExamplesMenu.appendChild(domButton);
		});

		this.dom.appendChild(this.domExamplesMenu);
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

			#jaffle-menu-btn {
				font-size: 22px;
				width: 1.8em;
			}

			#jaffle-menu {
				display: none;
				position: absolute;
				right: 0px;
				top: 35px;
				background-color: darkseagreen;
			}

			.jaffle-menu-item {
				width: 6.5em;
				margin: 0;
				padding: 5px;
				text-align: right;
				border-top: 3px solid #002b36;
				cursor: pointer;
			}

			.jaffle-menu-item:hover {
				background-color: cadetblue;
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

			.jaffle-tab-active {
				background-color: #002b36 !important;
				cursor: default;
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
			}
			
			#jaffle-examples-menu {
				display: none;
				position: absolute;
				max-width: 600px;
				top: 67px;
				right: 7.1em;
				background-color: #002b36;
				padding: 3px;
				padding-bottom: 0;
				padding-left: 0;
			}

			.jaffle-example-btn {
				display: inline-block;
				float: left;
				background-color: darkseagreen;
				border: none;
				margin: 0;
				padding: 5px;
				margin-left: 3px;
				margin-bottom: 3px;
				cursor: pointer;
			}

			.jaffle-example-btn:hover {
				background-color: cadetblue;
			}
			`);
		return style;
	}
}

export default EditorBar;
