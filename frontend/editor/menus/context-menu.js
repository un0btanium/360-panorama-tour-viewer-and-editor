import Main from 'frontend/main';

import LoginMenu from 'frontend/menus/login-menu';


/**
 * A context menu for the editor that opens on right-clicking inside the panorama.
 * @class ContextMenu
 * @static
 */
export default class ContextMenu {

	/**
	 * Initializes the context menu.
	 * Run this function first so that other editor classes are able to add options to the menu.
	 * @method setup
	 * @static
	 */
	static setup() {
		let editorCreationSelectionMenu = document.createElement('div');
		editorCreationSelectionMenu.id = "editor-creation-selection-menu";
		let editorCreationOptions = document.createElement('ul');
		editorCreationOptions.classList.add('editor-creation-options');
		editorCreationSelectionMenu.appendChild(editorCreationOptions);
		document.body.appendChild(editorCreationSelectionMenu);

		let htmlEditingMenuElements = {
			creationSelection:	editorCreationSelectionMenu
		}
		state.htmlElements = {...state.htmlElements, ...htmlEditingMenuElements };

		// add event listeners for opening and closing the creation context menu menu
		let body = document.querySelector('body');
		body.addEventListener('contextmenu', (event) => {
			event.preventDefault();
			
			if (!state.settings.editorEnabled) {
				return;
			}
			
			if (state.tempData.disableInteraction) {
				return;
			}
			
			try {
				let coords = state.viewer.view().screenToCoordinates({ x: event.clientX, y: event.clientY });
				state.tempData.yaw = Main.radToDeg(coords.yaw);
				state.tempData.pitch = Main.radToDeg(coords.pitch);
				state.tempData.x = event.clientX;
				state.tempData.y = event.clientY;

				ContextMenu.toggle();
			} catch(e) {
				LoginMenu.checkIfAlreadyLoggedIn();
			} 
	
		});
		body.addEventListener('mousedown', (event) => {
			ContextMenu.close();
		});
	}

	/**
	 * Adds a option as a clickable button to the context menu. 
	 * @method addOption
	 * @static
	 * @param {String} displayLabel The name to display for the button.
	 * @param {Function()} onClick The function to call when the user clicks on the button.
	 * @param {Boolean} withSeperationLine If true, adds a small line to visually seperate the menu.
	 */
	static addOption(displayLabel, onClick=()=>{}, withSeperationLine=false) {
		let option = document.createElement('li');
		option.classList.add('creation-option');
		if (withSeperationLine) {
			option.classList.add('green-seperation-line');
		}
	
		let text = document.createElement('div');
		text.classList.add('text');
		text.innerText = displayLabel;
		option.appendChild(text)

		option.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			onClick();
			ContextMenu.close();
		});
	
		state.htmlElements.creationSelection.querySelector('.editor-creation-options').appendChild(option);
	}
	
	/**
	 * Opens/Closes the context menu.
	 * @method toggle
	 * @static
	 */
	static toggle() {
		if (state.htmlElements.creationSelection.classList.contains("visible")) {
			ContextMenu.close();
		} else {
			ContextMenu.open();
		}
	}
	
	/**
	 * Opens the context menu.
	 * @method open
	 * @static
	 */
	static open() {
		state.htmlElements.creationSelection.classList.add("visible");
		state.htmlElements.creationSelection.style.left = state.tempData.x + "px";
		state.htmlElements.creationSelection.style.top  = state.tempData.y + "px";
	}
	
	/**
	 * Closes the context menu.
	 * @method close
	 * @static
	 */
	static close() {
		state.htmlElements.creationSelection.classList.remove("visible");
	}
	
}