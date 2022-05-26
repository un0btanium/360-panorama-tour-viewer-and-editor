import Panoramas from 'frontend/marzipano/panoramas';

	
/**
 * This class provides static functions for initializing, opening and closing a list containing all marzipano panorama scenes.
 * The user can navigate between the individual panoramas by clicking on them.
 * Panoramas are sorted by building name and floor into sub-categories that can be collapsed and expanded.
 * @class PanoramaList
 * @static
 */
export default class PanoramaList {

	/**
	 * Initializes the panorama list.
	 * @method setup
	 * @static
	 */
	static setup() {
		// set handler for panorama list toggle
		state.htmlElements.panoramaListToggle.addEventListener('click', PanoramaList.toggle);
	
		// start with the panorama list open on desktop
		if (!document.body.classList.contains('mobile')) {
			PanoramaList.open();
		}
	
		PanoramaList.refresh();
	}
	
	/**
	 * Refreshes and updates the panorama list and its entries. This is useful in case panoramas are added, edited or deleted.
	 * @method refresh
	 * @static
	 */
	static refresh() {
	
		// clear current panorama elements from panorama container
		let panoramaContainer = state.htmlElements.panoramaList.querySelector('.panoramas');
		while (panoramaContainer.hasChildNodes()) {
			panoramaContainer.removeChild(panoramaContainer.lastChild);
		}
	
		// set handler for panorama switch
		let buildings = {};
		let buildingNames = [];
		let outdoor = {};
		let outdoorNames = [];
		Object.values(state.panoramasByID).forEach((panorama) => {
			if (panorama.data.isIndoors) {
				let buildingName = panorama.data.building === "" ? "Unnamed" : panorama.data.building;

				// building name
				if (buildings[buildingName] === undefined) {
					buildings[buildingName] = {};
					buildingNames.push(buildingName);
				}
	
				// building floor
				if (buildings[buildingName][panorama.data.floor] === undefined) {
					buildings[buildingName][panorama.data.floor] = [];
				}
				buildings[buildingName][panorama.data.floor].push(panorama);
			} else {
				let name = panorama.data.name === "" ? "Unnamed" : panorama.data.name;
				if (!outdoor[name]) {
					outdoor[name] = [];
					outdoorNames.push(name);
				}
				outdoor[name].push(panorama);
			}
		});
	
		buildingNames.sort((a,b) => !b.toLowerCase().localeCompare(a.toLowerCase()));
		outdoorNames.sort((a,b) => !b.toLowerCase().localeCompare(a.toLowerCase()));

		
		let panoramaListHTMLElement = state.htmlElements.panoramaList.querySelector('.panoramas');

		for (let outdoorName of outdoorNames) {
			if (outdoor[outdoorName].length === 1) {
				PanoramaList.createPanoramaListEntry(outdoor[outdoorName][0], panoramaListHTMLElement, 'border-left-small', false);
			} else {
				let buildingCollapsible = PanoramaList.createCollapsible(panoramaListHTMLElement, false, outdoorName);
	
				outdoor[outdoorName].forEach((panorama) => {
					PanoramaList.createPanoramaListEntry(panorama, buildingCollapsible, 'border-left-medium');
				})
			}
		}

		for (let buildingName of buildingNames) {
			let buildingCollapsible = PanoramaList.createCollapsible(panoramaListHTMLElement, true, "Unnamed", buildingName);

			for (let floor in buildings[buildingName]) {
				let floorCollapsible = PanoramaList.createCollapsible(buildingCollapsible, true, "Unnamed", buildingName, floor);
				
				let panoramasOfBuilding = buildings[buildingName][floor].sort((a,b) => a.data.name.toLowerCase().localeCompare(b.data.name.toLowerCase()));
				panoramasOfBuilding.forEach((panorama) => {
					PanoramaList.createPanoramaListEntry(panorama, floorCollapsible);
				})

			}
		};

	}
	
	/**
	 * Updates the highlighting of the panorama list based on the panorama provided as argument.
	 * Useful when switching to a different panorama.
	 * @method update
	 * @static
	 * @param {Object} panorama The panorama object which should be highlighted in the panorama list.
	 */
	static update(panorama) {
		let panoramaListElements = state.htmlElements.panoramaList.querySelectorAll('.panoramas .panorama');
		panoramaListElements.forEach((el) => {
			if (el.getAttribute('panorama-id') === panorama.data._id) {
				el.classList.add('current');
			} else {
				el.classList.remove('current');
			}
		})

		if (panorama.data.isIndoors) {
			let buildingName = (panorama.data.building === "") ? "Unnamed" : panorama.data.building;
			let collapsibleButtons = state.htmlElements.panoramaList.querySelectorAll('.collapsible-button');
			collapsibleButtons.forEach((button) => {
				if (button.getAttribute("isIndoors") === "false"
					|| !(
						button.getAttribute("buildingName") === buildingName
						&& (
							button.getAttribute("floor") === "undefined"
							|| button.getAttribute("floor") === ''+panorama.data.floor
						)
					)
				) {
					button.classList.remove('current');
					PanoramaList.closeCollapsibleContent(button);
				} else {
					button.classList.add('current');
					PanoramaList.openCollapsibleContent(button);
				}
			});
		} else {
			let name = (panorama.data.name === "") ? "Unnamed" : panorama.data.name;
			let collapsibleButtons = state.htmlElements.panoramaList.querySelectorAll('.collapsible-button');
			collapsibleButtons.forEach((button) => {
				if (button.getAttribute("isIndoors") === "true"
					|| !(button.getAttribute("name") === name)
				) {
					button.classList.remove('current');
					PanoramaList.closeCollapsibleContent(button);
				} else {
					button.classList.add('current');
					PanoramaList.openCollapsibleContent(button);
				}
			});
		}
	}

	/**
	 * Creates a new entry in the panorama list.
	 * @method createPanoramaListEntry
	 * @static
	 * @param {Object} panorama The panorama to create a new list entry from.
	 * @param {HTMLElement} parentHTMLElement The html element to attach this entry onto.
	 */
	static createPanoramaListEntry(panorama, parentHTMLElement, borderLeftClass='border-left-large', isIndented=true) {
		let linkElem = document.createElement('div');
		linkElem.classList.add('panorama');
		linkElem.classList.add(borderLeftClass);
		linkElem.setAttribute('title', "" + panorama.data.name)
		linkElem.setAttribute("panorama-id", panorama.data._id);

		let liElem = document.createElement('li');
		liElem.classList.add('text');
		if (isIndented) {
			liElem.classList.add('indented');
		}
		liElem.innerHTML = panorama.data.name;

		linkElem.appendChild(liElem);

		linkElem.addEventListener('click', () => {
			Panoramas.switchToPanorama(panorama);
			// on mobile, hide panorama list after selecting a panorama
			if (document.body.classList.contains('mobile')) {
				PanoramaList.close();
			}
		});

		parentHTMLElement.appendChild(linkElem);
	}
	
	
	/**
	 * Opens the panorama list.
	 * @method open
	 * @static
	 */
	static open() {
		state.htmlElements.panoramaList.classList.add('enabled');
		state.htmlElements.panoramaListToggle.classList.add('enabled');
	}
	
	/**
	 * Closes the panorama list.
	 * @method close
	 * @static
	 */
	static close() {
		state.htmlElements.panoramaList.classList.remove('enabled');
		state.htmlElements.panoramaListToggle.classList.remove('enabled');
	}
	
	/**
	 * Toggles the panorama list.
	 * @method toggle
	 * @static
	 */
	static toggle() {
		state.htmlElements.panoramaList.classList.toggle('enabled');
		state.htmlElements.panoramaListToggle.classList.toggle('enabled');
	}
	
	
	//// COLLAPSIBLE CONTENT

	/**
	 * Creates a new collapsible html element for the panorama list and attaches it to the parent html element.
	 * @method createCollapsible
	 * @static
	 * @param {HTMLElement} parentHTMLElement The html element to append the collapsible button and content onto.
	 * @param {Boolean} isIndoors If the panorama was taken indoors.
	 * @param {String} buildingName The name of building.
	 * @param {Number} [floor=undefined] The floor number of the building. This is optional.
	 * @return The html element holding the content of the collapsible.
	 */
	static createCollapsible(parentHTMLElement, isIndoors, name, buildingName="", floor=undefined) {
		let displayName;
		let identifierName;
		if (isIndoors) {
			displayName = (floor == undefined) ? buildingName : ""+floor;
			identifierName = (buildingName + "-" + floor).replace(/ /g, '_').replace(/\./g, '_');
		} else {
			displayName = name;
			identifierName = "outdoors-" + name.replace(/ /g, '_').replace(/\./g, '_');
		}

		let textWithIcon = <div class='text'><i class="fas fa-angle-right"></i> {displayName}</div>;

		let button = document.createElement('div');
		button.classList.add('collapsible-button');
		button.classList.add('panorama');
		if (floor === undefined) {
			button.classList.add('border-left-small');
		} else {
			button.classList.add('border-left-medium');
		}
		button.setAttribute('title', displayName)
		button.setAttribute("name", name);
		button.setAttribute("isIndoors", '' + isIndoors);
		button.setAttribute("buildingName", buildingName);
		button.setAttribute("floor", floor);
		button.appendChild(textWithIcon);

		let content = document.createElement('div');
		content.classList.add('collapsible-content');
		content.classList.add("collapsible-" + identifierName);
		button.setAttribute("name", name);
		button.setAttribute("isIndoors", '' + isIndoors);
		content.setAttribute("buildingName", buildingName);
		content.setAttribute("floor", floor);
		content.style.maxHeight = "0px";
		content.style.minHeight = "0px";
		
		button.addEventListener('click', (e) => {
			PanoramaList.toggleCollapsibleContent(button, content, parentHTMLElement);
		})

		parentHTMLElement.appendChild(button);
		parentHTMLElement.appendChild(content);

		return content;
	}
	
	/**
	 * Toggles the collapsible element containing the panoramas in the panorama list.
	 * @method toggleCollapsibleContent
	 * @static
	 * @param {HTMLElement} button The button html element that was clicked on.
	 * @param {HTMLElement} contentHTMLElement The corresponding content html element.
	 * @param {HTMLElement} parentHTMLElement The parent html element of both the button and content html element.
	 */
	static toggleCollapsibleContent(button, contentHTMLElement, parentHTMLElement) {
		let icon = button.querySelector('i');
		if (icon.classList.contains('fa-angle-right')) {
			icon.classList.replace('fa-angle-right', 'fa-angle-down');
		} else {
			icon.classList.replace('fa-angle-down', 'fa-angle-right');
		}

		let isOpen = contentHTMLElement.style.maxHeight !== "0px";
		if (parentHTMLElement.classList.contains('collapsible-content')) {  // adjust parent collapsible if this is a floor collapsible
			let height = parseInt(parentHTMLElement.style.maxHeight.replace("px", ""));
			if (isOpen) {
				let heightContent = parseInt(contentHTMLElement.style.maxHeight.replace("px", ""));
				parentHTMLElement.style.maxHeight = (height - heightContent) + "px";
				parentHTMLElement.style.minHeight = (height - heightContent) + "px";
			} else {
				parentHTMLElement.style.maxHeight = (height + contentHTMLElement.scrollHeight) + "px";
				parentHTMLElement.style.minHeight = (height + contentHTMLElement.scrollHeight) + "px";
			}
		}
		
		if (isOpen) {
			contentHTMLElement.style.maxHeight = "0px";
			contentHTMLElement.style.minHeight = "0px";
		} else {
			contentHTMLElement.style.maxHeight = contentHTMLElement.scrollHeight + "px";
			contentHTMLElement.style.minHeight = contentHTMLElement.scrollHeight + "px";
		}
	}
	
	/**
	 * Opens the collapsible element containing the panoramas in the panorama list.
	 * @method openCollapsibleContent
	 * @static
	 * @param {Object} button The html element that is supposed to be toggled.
	 */
	static openCollapsibleContent(button) {
		button.querySelector('i').classList.replace('fa-angle-right', 'fa-angle-down');

		let isIndoors = button.getAttribute("isIndoors") === "true";

		let selector;
		if (isIndoors) {
			selector = button.getAttribute("buildingName") + "-" + button.getAttribute("floor");
		} else {
			selector = "outdoors-" + button.getAttribute("name");
		}
		selector = selector.replace(/ /g, '_').replace(/\./g, '_');

		let contentHTMLElement = state.htmlElements.panoramaList.querySelector(".collapsible-" + selector);
		if (contentHTMLElement.style.maxHeight === "0px") {
			
			if (isIndoors && button.getAttribute("floor") !== "undefined") { // adjust parent collapsible if this is a floor collapsible
				let parentHTMLElement = state.htmlElements.panoramaList.querySelector(".collapsible-" + button.getAttribute("buildingName").replace(/ /g, '_').replace(/\./g, '_') + "-undefined");
				if (parentHTMLElement.classList.contains('collapsible-content')) {
					let height = parseInt(parentHTMLElement.style.maxHeight.replace("px", ""));
					parentHTMLElement.style.maxHeight = (height + contentHTMLElement.scrollHeight) + "px";
					parentHTMLElement.style.minHeight = (height + contentHTMLElement.scrollHeight) + "px";
				}
			}
		
			contentHTMLElement.style.maxHeight = contentHTMLElement.scrollHeight + "px";
			contentHTMLElement.style.minHeight = contentHTMLElement.scrollHeight + "px";
		}
	}
	
	/**
	 * Closes the collapsible element containing the panoramas in the panorama list.
	 * @method closeCollapsibleContent
	 * @static
	 * @param {Object} button The html element that is supposed to be toggled.
	 */
	static closeCollapsibleContent(button) {
		button.querySelector('i').classList.replace('fa-angle-down', 'fa-angle-right');

		let isIndoors = button.getAttribute("isIndoors") === "true";

		let selector;
		if (isIndoors) {
			selector = button.getAttribute("buildingName") + "-" + button.getAttribute("floor");
		} else {
			selector = "outdoors-" + button.getAttribute("name");
		}
		selector = selector.replace(/ /g, '_').replace(/\./g, '_');

		let contentHTMLElement = state.htmlElements.panoramaList.querySelector(".collapsible-" + selector);
		if (contentHTMLElement.style.maxHeight !== "0px") {
			
			if (isIndoors && button.getAttribute("floor") !== "undefined") { // adjust parent collapsible if this is a floor collapsible
				let parentHTMLElement = state.htmlElements.panoramaList.querySelector(".collapsible-" + button.getAttribute("buildingName").replace(/ /g, '_').replace(/\./g, '_') + "-undefined");
				if (parentHTMLElement.classList.contains('collapsible-content')) {
					let height = parseInt(parentHTMLElement.style.maxHeight.replace("px", ""));
					let heightContent = parseInt(contentHTMLElement.style.maxHeight.replace("px", ""));
					parentHTMLElement.style.maxHeight = (height - heightContent) + "px";
					parentHTMLElement.style.minHeight = (height - heightContent) + "px";
				}
			}
		
			contentHTMLElement.style.maxHeight = "0px";
			contentHTMLElement.style.minHeight = "0px";
		}
	}

	
}