import Main    				from 'frontend/main';
import Hotspots    			from 'frontend/marzipano/hotspots';
import DetailSidebar		from 'frontend/menus/detail-sidebar';

import HotspotEditor		from 'editor/editors/hotspot-editor';
import PanoramaEditor		from 'editor/editors/panorama-editor';

import YawSelectionMenu		from 'editor/menus/yaw-selection-menu';
import LocationPickerMenu	from 'editor/menus/location-picker-menu';


/**
 * Creates, opens and closes a sidebar with elements to edit panoramas and hotspots with.
 * The value types of panorama and hotspot attributes can be provided in a custom data representation to create fitting html input elements for the user.
 * @class EditorSidebar
 * @static
 */
export default class EditorSidebar {

	/**
	 * Sets up the editor sidebar.
	 * @method setup
	 * @static
	 */
	static setup() {
		let editorSidebar = document.createElement('div');
		editorSidebar.id = "editorSidebar";
		let editorSidebarContainer = document.createElement('ul');
		editorSidebarContainer.id = "editorSidebarContainer";
		editorSidebar.appendChild(editorSidebarContainer);
		document.body.appendChild(editorSidebar);

		state.htmlElements.editorSidebar = editorSidebar;
		state.htmlElements.editorSidebarContainer =	editorSidebarContainer;
	}

	/**
	 * Opens the sidebar editor to edit the hotspot with.
	 * Closes the editor sidebar if the sidebar is already containing the editor for the hotspot id.
	 * @method openHotspotEditorMenu
	 * @static
	 * @param {String} hotspotId The id of the hotspot to edit. 
	 */
	static openHotspotEditorMenu(hotspotId) {
		let hotspot = Hotspots.getHotspot(hotspotId);
		if (!hotspot) {
			return;
		}

		if (state.currentEditorSidebar._id === hotspotId) { // already open
			EditorSidebar.close();
			return;
		}

		let panoramaID = state.hotspots[hotspotId].panoramaID;
		let data = state.hotspots[hotspotId].data;
		let editableValues = EditorSidebar.getEditableValues(data.type);

		EditorSidebar.createMenu(panoramaID, data, editableValues)
	}

	/**
	 * Opens the sidebar editor to edit the currently viewed panorama with.
	 * Closes the editor sidebar if the sidebar is already containing the editor for the panorama.
	 * @method openPanoramaEditorMenu
	 * @static
	 */
	static openPanoramaEditorMenu() {
		let panoramaID = state.currentPanorama.data._id;
		let panorama = state.currentPanorama;

		if (!panorama) {
			return;
		}

		if (state.currentEditorSidebar._id === panoramaID) { // already open
			EditorSidebar.close();
			return;
		}

		EditorSidebar.createMenu(panoramaID, panorama.data, PanoramaEditor.getEditableValues(), "Edit");

		let northHotspot = {
			_id: panorama.data._id + "north",
			type: "north",
			yaw: panorama.data.orientation,
			pitch: -10
		}
		Hotspots.addHotspotToPanorama(panoramaID, northHotspot);
	}

	/**
	 * Returns the editable values and their types for the provided hotspot type.
	 * @method getEditableValues
	 * @static
	 * @param {String} hotspotType The name of the hotspot type.
	 * @return {Object} The object with the custom data representation with editable values and their types for the hotspot type.
	 */
	static getEditableValues(hotspotType) {
		return HotspotEditor.getHotspotType(hotspotType).getEditableValues();
	}

	/**
	 * Creates and opens a new editor menu for the hotspot/panorama.
	 * @method createMenu
	 * @static
	 * @param {String} panoramaId The panorama id the hotspot is in or the panorama that is to be edited.
	 * @param {Object} data The data of the panorama/hotspot to be displayed so that it can be edited.
	 * @param {Object} editableValues The object with the value types to create appropriate html input elements for each data attribute of the panorama/hotspot.
	 * @param {String} mode The mode the menu is in. Should either be "Edit" or "Create".
	 */
	static createMenu(panoramaId, data, editableValues, mode=undefined) {
		let elementsById = {};
		let isHotspot = panoramaId !== data._id;

		let menu = EditorSidebar.getDivWithClass('editor-editing-sidebar-menu');

		let container = EditorSidebar.getDivWithClass('editor-item-list-container');
		menu.appendChild(container);

		let headerRow = EditorSidebar.getRow();
		container.appendChild(headerRow);
		
		let headerLargeElement = EditorSidebar.getElementLarge();
		headerRow.appendChild(headerLargeElement);

		let headerText = EditorSidebar.getDivWithClass('editor-header-text');
		if (isHotspot) {
			headerText.innerText = data.type === "portal" ? "Edit Portal" : "Edit Hotspot";
		} else {
			headerText.innerText = mode + " Panorama " + panoramaId;
		}
		headerLargeElement.appendChild(headerText);

		for (let id in editableValues) {
			let element = editableValues[id];

			let elementRow = EditorSidebar.getRow();
			container.appendChild(elementRow);

			let elementLabel = EditorSidebar.getLabel(element.label);
			elementRow.appendChild(elementLabel);
			
			let elementContentContainer = EditorSidebar.getElementLarge();
			elementRow.appendChild(elementContentContainer);

			switch(element.type) {
				case 'text': {
					let text = document.createElement('input');
					text.classList.add('text-line-input');
					text.setAttribute("type", "text");
					text.setAttribute("autocomplete", "off");
					text.value = data[id];
					elementContentContainer.appendChild(text);
					elementsById[id] = {
						htmlElement: text,
						setValue: (value) => { text.value = value; },
						getValue: () =>		 { return text.value;  }
					};
					break;
				}
					
				case 'orientation': {
					let orientationLabel = document.createElement('label');
					orientationLabel.classList.add("range-label");
					orientationLabel.innerText = data[id];

					let orientationRange = document.createElement('input');
					orientationRange.classList.add('range');
					orientationRange.classList.add('clickable');
					orientationRange.setAttribute("type", "range");
					orientationRange.setAttribute("min", element.min   || -180);
					orientationRange.setAttribute("max", element.min   || 180);
					orientationRange.setAttribute("step", element.step || 1);
					orientationRange.setAttribute("value", data[id]);
					orientationRange.setAttribute("previousValue", data[id]);
					orientationRange.addEventListener("input", (e) => {
						let hotspotNorth = Hotspots.getHotspot(panoramaId + "north");
						hotspotNorth.marzipanoObject.setPosition({ yaw: Main.degToRad(e.target.value), pitch: hotspotNorth.marzipanoObject.position().pitch });
						orientationLabel.innerText = e.target.value;
						if (!isHotspot) {
							// calculate offset from previous value
							let offset = e.target.value - e.target.getAttribute("previousValue");
							// set new value as old value
							e.target.setAttribute("previousValue", e.target.value)
							// subtract offset from yaw
							elementsById["yaw"].setValue(elementsById["yaw"].getValue() - offset)
						}
					})
					orientationRange.addEventListener("change", (e) => {
						let hotspotNorth = Hotspots.getHotspot(panoramaId + "north");
						hotspotNorth.marzipanoObject.setPosition({ yaw: Main.degToRad(e.target.value), pitch: hotspotNorth.marzipanoObject.position().pitch });
						orientationLabel.innerText = e.target.value;
						if (!isHotspot) {
							// calculate offset from previous value
							let offset = e.target.value - e.target.getAttribute("previousValue");
							// set new value as old value
							e.target.setAttribute("previousValue", e.target.value)
							// subtract offset from yaw
							elementsById["yaw"].setValue(elementsById["yaw"].getValue() - offset)
						}
					})

					elementContentContainer.appendChild(orientationRange);
					elementContentContainer.appendChild(orientationLabel);

					elementsById[id] = {
						htmlElement: orientationLabel,
						setValue: (value) => { orientationRange.setAttribute("value", value); orientationLabel.innerText = value; },
						getValue: () =>		 { return orientationLabel.innerText; }
					};
					break;
				}

				case 'buttonYawMenu': {
					let button = EditorSidebar.getButton(data[id], "text-line-input");
					button.classList.add('sphere-coord-button');
					button.classList.add('clickable');
					button.setAttribute("alt", "select initial yaw");
					elementContentContainer.appendChild(button);
					elementsById[id] = {
						htmlElement: button,
						setValue: (value) => { button.innerText = value; },
						getValue: () =>		 { return button.innerText;  }
					};
					button.addEventListener('click', (e) => {
						e.stopPropagation();
						EditorSidebar.close();
						let yaw = parseFloat(button.innerText);
						let targetPanoramaId;
						if (isHotspot) {
							targetPanoramaId = elementsById[element.scene].getValue();
						} else {
							targetPanoramaId = state.currentPanorama.data._id;
							yaw = yaw + parseFloat(elementsById["orientation"].getValue()) - state.currentPanorama.data.orientation;
						}
						YawSelectionMenu.open(
							targetPanoramaId,
							yaw,
							(successful, targetYawResultInDegree) => {
								if (successful) {
									if (!isHotspot) {
										// let offset = targetYawResultInDegree - parseFloat(button.innerText)
										targetYawResultInDegree = targetYawResultInDegree - elementsById["orientation"].getValue() + state.currentPanorama.data.orientation
									}
									button.innerText = targetYawResultInDegree;
								}
								EditorSidebar.open(data._id, menu);
							}
						);
					});
					break;
				}

				case 'locationPicker': {
					let button = EditorSidebar.getButton(data.lat + ", " + data.lng, "text-line-input");
					button.classList.add('sphere-coord-button');
					button.classList.add('clickable');
					button.setAttribute("alt", "select location");
					elementContentContainer.appendChild(button);
					const getLocationFromString = (str) => { let array = str.split(", "); return { lat: parseFloat(array[0]), lng: parseFloat(array[1]) }; };
					elementsById[id] = {
						htmlElement: button,
						setValue: (value) => { button.innerText = value.lat + ", " + value.lng; },
						getValue: () =>		 { return getLocationFromString(button.innerText); }
					};
					button.addEventListener('click', (e) => {
						e.stopPropagation();
						EditorSidebar.close();
						LocationPickerMenu.open(
							elementsById['isIndoors'].getValue(),
							elementsById['building'].getValue(),
							parseInt(elementsById['floor'].getValue()),
							getLocationFromString(button.innerText),
							(successful, latitude, longitude) => {
								if (successful) {
									button.innerText = latitude + ", " + longitude;
								}
								EditorSidebar.open(data._id, menu);
							}
						);
					});
					break;
				}

				case 'dropdownScenes': {
					let dropdown = document.createElement('select');
					dropdown.classList.add('text-line-input');
					dropdown.classList.add('clickable');
					dropdown.setAttribute("size", "1");
					Object.values(state.panoramasByID).forEach((panorama) => {
						let option = document.createElement('option');
						option.setAttribute("value", panorama.data._id);
						option.innerText = panorama.data.name;
						dropdown.appendChild(option);
					})
					dropdown.value = data[id];
					elementContentContainer.appendChild(dropdown);
					elementsById[id] = {
						htmlElement: dropdown,
						setValue: (value) => { dropdown.value = value; },
						getValue: () =>		 { return dropdown.value;  }
					};
					break;
				}

				// case 'panoramaImages': {
				// 	let dropdownImages = document.createElement('select');
				// 	dropdownImages.classList.add('text-line-input');
				// 	dropdownImages.classList.add('clickable');
				// 	dropdownImages.setAttribute("size", "1");
				// 	Object.keys(state.panoramasByID).forEach((name) => {
				// 		let option = document.createElement('option');
				// 		option.setAttribute("value", name);
				// 		option.innerText = name;
				// 		dropdownImages.appendChild(option);
				// 	})
				// 	dropdownImages.value = data[id];
				// 	elementContentContainer.appendChild(dropdownImages);
				// 	elementsById[id] = {
				// 		htmlElement: dropdownImages,
				// 		setValue: (value) => { dropdownImages.value = value; },
				// 		getValue: () =>		 { return dropdownImages.value;  }
				// 	};
				// 	break;
				// }

				case 'checkbox': {
					let checkbox = document.createElement('input');
					checkbox.classList.add('check-box');
					checkbox.classList.add('clickable');
					checkbox.setAttribute("type", "checkbox");
					if (data[id]) {
						checkbox.checked = true;
					}
					elementContentContainer.appendChild(checkbox);
					elementsById[id] = {
						htmlElement: checkbox,
						setValue: (value) => { (value) ? checkbox.checked = true : checkbox.checked = false },
						getValue: () =>		 { return checkbox.checked; }
					};
					break;
				}

				case 'range': {
					let label = document.createElement('label');
					label.classList.add("range-label");
					label.innerText = data[id];

					let range = document.createElement('input');
					range.classList.add('range');
					range.classList.add('clickable');
					range.setAttribute("type", "range");
					range.setAttribute("min", element.min   || -180);
					range.setAttribute("max", element.max   || 180);
					range.setAttribute("step", element.step || 5);
					range.setAttribute("value", data[id]);
					range.addEventListener("input", (e) => { label.innerText = e.target.value; })
					range.addEventListener("change", (e) => { label.innerText = e.target.value; })
					
					elementContentContainer.appendChild(range);
					elementContentContainer.appendChild(label);

					elementsById[id] = {
						htmlElement: range,
						setValue: (value) => { range.setAttribute("value", value); label.innerText = value; },
						getValue: () =>		 { return label.innerText; }
					};
					break;
				}
			}
		}

		let buttonRow    = EditorSidebar.getRow();
		container.appendChild(buttonRow);

		let buttonWrapperCancel = EditorSidebar.getElementSmall();
		let buttonWrapperDelete = EditorSidebar.getElementSmall();
		let buttonWrapperSave   = EditorSidebar.getElementMedium();
		
		buttonRow.appendChild(buttonWrapperCancel);
		buttonRow.appendChild(buttonWrapperDelete);
		buttonRow.appendChild(buttonWrapperSave);

		let buttonCancel = EditorSidebar.getButton("Cancel", "cancel-button");
		let buttonDelete = EditorSidebar.getButton("Delete", "delete-button");
		let buttonSave   = EditorSidebar.getButton("Save", "apply-button");

		buttonCancel.innerText = "Cancel";
		buttonDelete.innerText = "Delete";
		buttonSave.innerText   = "Save";
		
		buttonWrapperCancel.appendChild(buttonCancel);
		buttonWrapperDelete.appendChild(buttonDelete);
		buttonWrapperSave.appendChild(buttonSave);


		buttonCancel.addEventListener('click', (e) => {
			e.stopPropagation();
			Hotspots.deleteHotspot(data._id + "north");
			EditorSidebar.close();
		});
		buttonDelete.addEventListener('click', (e) => {
			e.stopPropagation();
			if (isHotspot) {
				HotspotEditor.delete(data._id);
			} else {
				Hotspots.deleteHotspot(data._id + "north");
				PanoramaEditor.delete(data._id);
			}
		});
		buttonSave.addEventListener('click',   (e) => {
			e.stopPropagation();
			let newData = {
				_id: data._id
			};

			for (let elemId in elementsById) {
				let value = elementsById[elemId].getValue();
				if (editableValues[elemId].type === "locationPicker") {
					newData['lat'] = value.lat;
					newData['lng'] = value.lng;
				} else {
					newData[elemId] = value;
				}
			}

			if (isHotspot){
				HotspotEditor.update(newData);
			} else {
				Hotspots.deleteHotspot(data._id + "north");
				PanoramaEditor.update(newData);
				HotspotEditor.updateHotspotTargetYaws(data, newData);
			}
		});

		EditorSidebar.open(data._id, menu);
	}

	/**
	 * Create a new div html element and add the provided class name to it.
	 * @method getDivWithClass
	 * @static
	 * @param {String} clazz The class to add to the div element.
	 * @return {HTMLElement} The html element.
	 */
	static getDivWithClass(clazz) {
		let element = document.createElement('div');
		element.classList.add(clazz);
		return element;
	}

	/**
	 * Create a new html row element to display other content in.
	 * @method getRow
	 * @static
	 * @return {HTMLElement} The html element.
	 */
	static getRow() {
		return EditorSidebar.getDivWithClass('editor-item-element-row');
	}

	/**
	 * Create a small sized html element to display content in.
	 * @method getElementSmall
	 * @static
	 * @return {HTMLElement} The html element.
	 */
	static getElementSmall() {
		return EditorSidebar.getDivWithClass('editor-item-element-small');
	}

	/**
	 * Create a medium sized html element to display content in.
	 * @method getElementMedium
	 * @static
	 * @return {HTMLElement} The html element.
	 */
	static getElementMedium() {
		return EditorSidebar.getDivWithClass('editor-item-element-medium');
	}

	/**
	 * Create a large sized html element to display content in.
	 * @method getElementLarge
	 * @static
	 * @return {HTMLElement} The html element.
	 */
	static getElementLarge() {
		return EditorSidebar.getDivWithClass('editor-item-element-large');
	}

	/**
	 * Create a new html element to display header text in.
	 * @method getHeaderText
	 * @static
	 * @return {HTMLElement} The html element.
	 */
	static getHeaderText() {
		return EditorSidebar.getDivWithClass('editor-header-text');
	}


	/**
	 * Create a new html element to show text in.
	 * @method getLabel
	 * @static
	 * @param {String} text The text to be displayed in the label.
	 * @return {HTMLElement} The html element.
	 */
	static getLabel(text) {
		let elementLabel = EditorSidebar.getElementSmall();

		let elementLabelText = EditorSidebar.getDivWithClass('text-right');
		elementLabelText.innerText = text;
		elementLabel.appendChild(elementLabelText);

		return elementLabel;
	}

	/**
	 * Create a new html element to show a button in.
	 * @method getButton
	 * @static
	 * @param {String} label The text to display as a label inside the button.
	 * @param {String} clazz The class name of the button.
	 * @return {HTMLElement} The html element.
	 */
	static getButton(label, clazz) {
		let element = document.createElement('button');
		element.classList.add(clazz);
		element.innerText = label;
		return element;
	}

	
	/**
	 * Open the editor sidebar with the id of the panorama/hotspot and the editor content.
	 * @method open
	 * @static
	 * @param {String} id The id of the panorama/hotspot.
	 * @param {HTMLElement} menu The html element with the editor menu elements.
	 */
	static open(id, menu) {
		// clear content
		let last;
		while (last = state.htmlElements.editorSidebarContainer.lastChild) {
			state.htmlElements.editorSidebarContainer.removeChild(last);
		}

		DetailSidebar.close();

		let editorSidebarContentEntry = document.createElement('li');
		editorSidebarContentEntry.classList.add('editorSidebarContentEntry');

		state.htmlElements.editorSidebarContainer.appendChild(editorSidebarContentEntry);
		editorSidebarContentEntry.appendChild(menu);
		
		if (!state.htmlElements.editorSidebar.classList.contains('enabled')) {
			state.htmlElements.editorSidebar.classList.add('enabled');
		}

		state.currentEditorSidebar = { _id: id, menu: menu };
	}
	
	/**
	 * Close the editor sidebar
	 * @method close
	 * @static
	 */
	static close() {
		if (state.currentEditorSidebar._id) {
			if (state.htmlElements.editorSidebar.classList.contains('enabled')) {
				state.htmlElements.editorSidebar.classList.remove('enabled');
			}
			state.currentEditorSidebar = { _id: undefined, menu: undefined };
		}
	}
}
