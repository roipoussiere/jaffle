type OnButtonClick = () => void;
type OnTabSwitch = (oldTabId: string, newTabId: string) => void;

export type Button = {
	id: string,
	label: string,
	tooltip: string,
	onClick: OnButtonClick,
}

export type Tab = {
	id: string,
	label: string,
	tooltip: string,
}

export class EditorBar {
	title: string;

	tabs: Array<Tab>;

	buttons: Array<Button>;

	activeTabId: string;

	onTabSwitch: OnTabSwitch;

	dom: HTMLElement;

	domTitle: HTMLParagraphElement;

	domTabs: { [key: string]: HTMLButtonElement };

	constructor(title: string, tabs: Array<Tab>, buttons: Array<Button>, activeTabId?: string) {
		this.title = title;
		this.tabs = tabs;
		this.buttons = buttons;
		this.activeTabId = activeTabId || this.tabs[0].id;

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		this.onTabSwitch = () => {};
		this.domTabs = {};
	}

	build(domContainer: HTMLElement) {
		this.dom = document.createElement('div');
		this.dom.id = 'jaffle-editor-bar';

		this.buildTitle();
		this.tabs.forEach((tab) => this.buildTab(tab));
		this.buildMenuButton();
		this.buttons.reverse().forEach((button) => this.buildButton(button));
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

	private buildMenuButton(): void {
		let timer: NodeJS.Timeout;

		const domMenu = document.createElement('div');
		domMenu.id = 'jaffle-menu';
		domMenu.addEventListener('mouseover', () => {
			clearTimeout(timer);
		});
		domMenu.addEventListener('mouseout', () => {
			timer = setTimeout(() => {
				domMenu.style.display = 'none';
			}, 200);
		});

		const menuItem1 = document.createElement('p');
		menuItem1.className = 'jaffle-menu-item';
		menuItem1.innerText = 'Visit Jaffle website';
		domMenu.appendChild(menuItem1);

		const menuItem2 = document.createElement('p');
		menuItem2.className = 'jaffle-menu-item';
		menuItem2.innerText = 'Load examples';
		domMenu.appendChild(menuItem2);

		const domButton = document.createElement('button');
		domButton.id = 'jaffle-menu-btn';
		domButton.className = 'jaffle-btn';
		domButton.innerText = '≡';
		domButton.addEventListener('mouseover', () => {
			clearTimeout(timer);
			domMenu.style.display = 'block';
		});
		domButton.addEventListener('mouseout', () => {
			timer = setTimeout(() => {
				domMenu.style.display = 'none';
			}, 200);
		});

		this.dom.appendChild(domButton);
		this.dom.appendChild(domMenu);
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
				margin: 0;
				padding: 5px;
				text-align: right;
				border-top: 3px solid #002b36;
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
			}`);
		return style;
	}
}

export default EditorBar;
