import DetailSidebar 	from 'frontend/menus/detail-sidebar';

/**
 * The hotspot type to create and edit POI (point of interest) hotspot with.
 * The POI hotspot is used to display relevant information in the near vicinity of a panorama to the viewer.
 * @class POI
 * @static
 */
export default class POI {
	
	/**
	 * Create a new hotspot of this hotspot type with the provided hotspot data.
	 * @method create
	 * @static
	 * @param {Object} hotspotData The hotspot data to create a new hotspot from.
	 * @return The new hotspot html element.
	 */
	static create(hotspotData) {
		// create wrapper element to hold icon and tooltip
		var wrapper = document.createElement('div');
		wrapper.classList.add('hotspot');
		wrapper.classList.add('poi-hotspot');
		wrapper.setAttribute("hotspotId", hotspotData._id);

		// set sized based on distance
		wrapper.style.setProperty('width', (25+hotspotData.size) + "px");
		wrapper.style.setProperty('height', (25+hotspotData.size) + "px");

		// create icon element
		var iconWrapper = document.createElement('div');
		if (hotspotData.category && hotspotData.category.stringAttributes && hotspotData.category.stringAttributes.fontAwesomeIcon) {
			iconWrapper.classList.add('poi-hotspot-fontawesome-icon-wrapper');
			iconWrapper.style.setProperty('line-height', (25+hotspotData.size) + "px");
			let icon = <i class={"poi-hotspot-fontawesome-icon " + hotspotData.category.stringAttributes.fontAwesomeIcon}/>;
			icon.style.setProperty('font-size', (10+hotspotData.size) + "px");
			iconWrapper.appendChild(icon);
		} else {
			iconWrapper.classList.add('poi-hotspot-icon-wrapper');
			var icon = document.createElement('img');
			icon.src = 'img/info.png';
			icon.classList.add('poi-hotspot-icon');
			iconWrapper.appendChild(icon);
		}

		// create tooltip element
		var tooltip = document.createElement('div');
		tooltip.classList.add('poi-hotspot-tooltip');
		tooltip.style.setProperty('top', 7-((20-hotspotData.size)/2) +'px') 
		tooltip.innerText = hotspotData.name || "Point of Interest";

		wrapper.appendChild(iconWrapper);
		wrapper.appendChild(tooltip);

		var toggle = function () {
			DetailSidebar.toggle(hotspotData);
		};

		// show/hide sidebar content when hotspot is clicked
		wrapper.addEventListener('click', toggle);

		return wrapper;
	}

	/**
	 * Edit an existing hotspot of this hotspot type with the provided hotspot data.
	 * @method edit
	 * @static
	 * @param {Object} data The data with the changes to edit the hotspot with. Includes the id of the hotspot that is supposed to be edited.
	 */
	static edit(data) {
		// cant edit pois from the backend; function implementation still required
	}
	
}