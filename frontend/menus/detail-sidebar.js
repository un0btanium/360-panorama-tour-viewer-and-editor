
/**
 * This static class provides functionality for a sidebar to show information based on Point of Interest data.
 * @class DetailSidebar
 * @static
 */
export default class DetailSidebar {

	/**
	 * Opens and closes the detail sidebar with the content of the provided POI data.
	 * @method toggle
	 * @static
	 * @param {Object} data The POI data to be displayed.
	 */
	static toggle(data) {
		if (data._id && state.currentSidebar._id) {
			if (state.currentSidebar._id === data._id) { // check by id
				DetailSidebar.close();
			} else {
				DetailSidebar.open(data);
			}
		} else if (state.currentSidebar.latitude && state.currentSidebar.longitude && data.latitude && data.longitude) {
			if (state.currentSidebar.latitude === data.latitude && state.currentSidebar.longitude === data.longitude) { // check by latitude and longitude
				DetailSidebar.close();
			} else {
				DetailSidebar.open(data);
			}
		} else {
			DetailSidebar.open(data);
		}
	}

	/**
	 * Opens the detail sidebar with the content of the provided POI data.
	 * @method open
	 * @static
	 * @param {Object} data The POI data to be displayed.
	 */
	static open(data) {
		DetailSidebar.update(data);
		if (!state.htmlElements.sidebar.classList.contains('enabled')) {
			state.htmlElements.sidebar.classList.add('enabled');
		}
		state.currentSidebar = data;
	}

	/**
	 * Closes the detail sidebar.
	 * @method close
	 * @static
	 */
	static close() {
		if (state.htmlElements.sidebar.classList.contains('enabled')) {
			state.htmlElements.sidebar.classList.remove('enabled');
		}
		state.currentSidebar = { };
	}
	

	/**
	 * Updates the detail sidebar content based on the provided POI data.
	 * @method update
	 * @static
	 * @param {Object} poiData The POI data to be displayed.
	 */
	static update(poiData) {
		// clear content
		let last;
		while (last = state.htmlElements.sidebarContainer.lastChild) {
			state.htmlElements.sidebarContainer.removeChild(last);
		}

		// close button for mobile
		let hasImageContent = poiData.contents.filter(content => content.mimeTypeUri && content.mimeTypeUri.includes("image")).length > 0;
		let closeButton = (
			<div class={"detail-sidebar-button-wrapper" + (hasImageContent ? "" : " additional-space") }>
				<div class="close-button-mobile">
					<img class="close-button-icon"src="img/left.png" />
				</div>
				<div class="close-button-desktop">
					<img class="close-button-icon"src="img/close.png" />
				</div>
			</div>
		);
		state.htmlElements.sidebarContainer.appendChild(closeButton);
		closeButton.addEventListener('click', (e) => {
			e.stopPropagation();
			DetailSidebar.close();
		})

		// header info
		DetailSidebar.addHeader(poiData);

		// description text
		if (poiData.description) {
			DetailSidebar.addSectionHeader("Beschreibung");
			DetailSidebar.addDescriptionText(poiData);
		}
		
		// people
		if (poiData.persons && poiData.persons.length > 0) {
			DetailSidebar.addSectionHeader("Personen");
			for (let person of poiData.persons) {
				DetailSidebar.addPerson(person);
			}
		}
	}


	/**
	 * Creates a UI element that acts a visual divider.
	 * Adds it directly to the sidebar unless another parent HTMLElement is provided.
	 * @method addDividerLine
	 * @static
	 * @param {HTMLElement} [parent=state.htmlElements.sidebarContainer] The parent HTMLElement to append the newly created HTMLElement to.
	 * @return The html element.
	 */
	static addDividerLine(parent=state.htmlElements.sidebarContainer) {
		let htmlElement = (
			<div class={'divider-line' + ((parent === state.htmlElements.sidebarContainer) ? ' sidebarContentEntry' : '')}></div>
		);

		parent.appendChild(htmlElement);
		return htmlElement;
	}

	/**
	 * Creates the header UI elements for the sidebar.
	 * Adds it directly to the sidebar unless another parent HTMLElement is provided.
	 * @method addHeader
	 * @static
	 * @param {Object} poiData Information about the Point of Interest.
	 * @param {HTMLElement} [parent=state.htmlElements.sidebarContainer] The parent HTMLElement to append the newly created HTMLElement to.
	 * @return The html element.
	 */
	static addHeader(poiData, parent=state.htmlElements.sidebarContainer) {
		let container = (
			<div class='sidebar-header-container'></div>
		)

		if (poiData.category && poiData.category.stringAttributes) {
			container.style.backgroundColor = poiData.category.stringAttributes.bodyColor || "#4f7216"; // probably always set to green-ish color
			container.style.color = poiData.category.stringAttributes.iconContainerColor || "#ebffcc"; // probably always  set to white-ish color
			// container.style.color = poiData.category.stringAttributes.iconColor || "#ebffcc"; // alternative (probably always set to black-ish color)
		}

		// header image
		let images = poiData.contents.filter(content => content.mimeTypeUri && content.mimeTypeUri.includes("image"));
		if (images.length > 0) {
			DetailSidebar.addHeaderImages(images, container);
		}

		DetailSidebar.addHeaderText(poiData, container).classList.add('sidebar-header-container-child');
		DetailSidebar.addCategoryName(poiData, container).classList.add('sidebar-header-container-child', 'indented');
		DetailSidebar.addBuildingInfo(poiData, container).classList.add('sidebar-header-container-child', 'indented');
		
		parent.appendChild(container);
		return container;
	}

	/**
	 * Adds Point of Interest images to the header. Uses a carousel if there is more than one image.
	 * @method addHeaderImages
	 * @static
	 * @param {Array} images List with information about the individual images.
	 * @param {HTMLElement} parent The header HTMLElement.
	 * @return The html element.
	 */
	static addHeaderImages(images, parent) {
		if (images.length === 0) {
			return;
		}

		let imageObjects = [];
		for (let image of images) {
			let htmlElement = <div class='header-image-container'><img class='header-image item' src={image.uri} alt={image.name} /></div>;
			let indicator = <li class='indicator-dot'></li>;

			let thisImageObject = {image: htmlElement, indicator: indicator };
			imageObjects.push(thisImageObject)

			indicator.addEventListener('click', () => {
				for (let imageObject of imageObjects) {
					if (imageObject === thisImageObject) {
						imageObject.image.style.display = 'block';
						imageObject.indicator.classList.add('active');
					} else {
						imageObject.image.style.display = 'none';
						imageObject.indicator.classList.remove('active');
					}
				}
			});

		}

		imageObjects[0].image.style.display = 'block';
		imageObjects[0].indicator.classList.add('active');

		let indicators = null;
		if (imageObjects.length > 1) {
			indicators = (
				<ol class='carousel-indicators'>
					{imageObjects.map((obj) => obj.indicator)}
				</ol>
			);
		}

		let htmlElement = (
			<div class='carousel'>
				{indicators}
				<div class='carousel-inner'>
					{imageObjects.map((obj) => obj.image)}
				</div>
			</div>
		);

		parent.appendChild(htmlElement);
		return htmlElement;
	}

	
	/**
	 * Adds header text to the header.
	 * @method addHeaderText
	 * @static
	 * @param {Object} poiData Information about the Point of Interest.
	 * @param {HTMLElement} [parent=state.htmlElements.sidebarContainer] The parent HTMLElement to append the newly created HTMLElement to.
	 * @return The html element.
	 */
	static addHeaderText(poiData, parent=state.htmlElements.sidebarContainer) {
		let htmlElement = (
			<div class={'header-text' + ((parent === state.htmlElements.sidebarContainer) ? ' sidebarContentEntry' : '')}>{poiData.name}</div>
		);

		parent.appendChild(htmlElement);
		return htmlElement;
	}

	/**
	 * Adds the building information (e.g. address) to the header.
	 * @method addBuildingInfo
	 * @static
	 * @param {Object} poiData Information about the Point of Interest.
	 * @param {HTMLElement} [parent=state.htmlElements.sidebarContainer] The parent HTMLElement to append the newly created HTMLElement to.
	 * @return The html element.
	 */
	static addBuildingInfo(poiData, parent=state.htmlElements.sidebarContainer) {
		let buildingInfoArray = [];
		if (poiData.address.building && poiData.address.building !== "") {
			buildingInfoArray.push(poiData.address.building);
		}
		if (poiData.address.street && poiData.address.street !== "") {
			buildingInfoArray.push(poiData.address.street);
		}
		if (poiData.address.zip && poiData.address.city && poiData.address.zip !== "" && poiData.address.city !== "") {
			buildingInfoArray.push(poiData.address.zip + " " + poiData.address.city);
		}

		let htmlElement = (
			<div class={'building-info' + ((parent === state.htmlElements.sidebarContainer) ? ' sidebarContentEntry' : '')}>
				{buildingInfoArray.join(", ")}
			</div>
		);
		
		parent.appendChild(htmlElement);
		return htmlElement;
	}

	/**
	 * Adds the category information to the header.
	 * @method addCategoryName
	 * @static
	 * @param {Object} poiData Information about the Point of Interest.
	 * @param {HTMLElement} [parent=state.htmlElements.sidebarContainer] The parent HTMLElement to append the newly created HTMLElement to.
	 * @return The html element.
	 */
	static addCategoryName(poiData, parent=state.htmlElements.sidebarContainer) {
		if (poiData && poiData.category && poiData.category.name) {
			let htmlElement = (
				<div class={'category-name' + ((parent === state.htmlElements.sidebarContainer) ? ' sidebarContentEntry' : '')}>
					<span><i class={poiData.category.stringAttributes.fontAwesomeIcon}/> {poiData.category.name}</span>
				</div>
			);

			parent.appendChild(htmlElement);
			return htmlElement;
		} else {
			return <div></div>;
		}
	}

	/**
	 * Adds the description text of the Point of Interest to the sidebar.
	 * Adds it directly to the sidebar unless another parent HTMLElement is provided.
	 * @method addDescriptionText
	 * @static
	 * @param {Object} poiData Information about the Point of Interest.
	 * @param {HTMLElement} [parent=state.htmlElements.sidebarContainer] The parent HTMLElement to append the newly created HTMLElement to.
	 * @return The html element.
	 */
	static addDescriptionText(poiData, parent=state.htmlElements.sidebarContainer) {
		let htmlElement = (
			<div class={'description-text' + ((parent === state.htmlElements.sidebarContainer) ? ' sidebarContentEntry' : '')}>
				{poiData.description}
			</div>
		);
		
		parent.appendChild(htmlElement);
		return htmlElement;
	}

	/**
	 * Adds a new title for a section to the sidebar.
	 * Adds it directly to the sidebar unless another parent HTMLElement is provided.
	 * @method addSectionHeader
	 * @static
	 * @param {String} headerText The text of the title.
	 * @param {HTMLElement} [parent=state.htmlElements.sidebarContainer] The parent HTMLElement to append the newly created HTMLElement to.
	 * @return The html element.
	 */
	static addSectionHeader(headerText, parent=state.htmlElements.sidebarContainer) {
		let htmlElement = (
			<div class={'section-header' + ((parent === state.htmlElements.sidebarContainer) ? ' sidebarContentEntry' : '')}>
				<span class='section-header-block'>.</span>
				<span class='section-header-text'>{" " + headerText}</span>
			</div>
		);

		parent.appendChild(htmlElement);
		DetailSidebar.addDividerLine(parent);
		return htmlElement;
	}

	/**
	 * Adds HTMLElement that displays information about a person including name, image and description text.
	 * Adds it directly to the sidebar unless another parent HTMLElement is provided.
	 * @method addPerson
	 * @static
	 * @param {Object} person Information about the person.
	 * @param {HTMLElement} [parent=state.htmlElements.sidebarContainer] The parent HTMLElement to append the newly created HTMLElement to.
	 * @return The html element.
	 */
	static addPerson(person, parent=state.htmlElements.sidebarContainer) {
		let image = null;
		if (person.image && person.image.uri) {
			image = (
				<img class='image' src={person.image.uri} alt={name.innerText + " Image"} />
			);
		}

		let description = null;
		if (person.description) {
			description = (
				<div class='description'>
					{person.description}
				</div>	
			);
		}
		
		let htmlElement = (
			<div class={'person' + ((parent === state.htmlElements.sidebarContainer) ? ' sidebarContentEntry' : '')}>
				<div class='name'>{(person.prefix ? person.prefix + " " : "") + (person.title ? person.title + " " : "") + (person.firstName ? person.firstName + " " : "") + (person.lastName ? person.lastName: "")}</div>
				<div class='container'>
					{image}
					{description}
				</div>
			</div>
		);

		parent.appendChild(htmlElement);
		return htmlElement;
	}
}