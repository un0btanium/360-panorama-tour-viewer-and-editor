import Main			from 'frontend/main';
import Hotspots		from 'frontend/marzipano/hotspots';
import Panoramas    from 'frontend/marzipano/panoramas';

/**
 * The hotspot type to create and edit Portal hotspot with.
 * The Portal hotspot is used to provide buttons in panoramas to let the user switch between individual panoramas and walk through the place virtually.
 * @class Portal
 * @static
 */
export default class Portal {

	/**
	 * Create a new hotspot of this hotspot type with the provided hotspot data.
	 * @method create
	 * @static
	 * @param {Object} hotspotData The hotspot data to create a new hotspot from.
	 * @return The new hotspot html element.
	 */
	static create(portalData) {
		// create wrapper element to hold icon and tooltip
		var wrapper = document.createElement('div');
		wrapper.setAttribute("hotspotId", portalData._id);
		wrapper.classList.add('hotspot');
		wrapper.classList.add('link-hotspot');

		// create image element
		var icon = document.createElement('img');
		icon.id = "portal-icon-" + portalData._id;
		icon.src = 'img/link.png';
		icon.classList.add('link-hotspot-icon');

		// set rotation transform
		for (let property of ['-ms-transform', '-webkit-transform', 'transform']) {
			icon.style[property] = 'rotate(' + Main.degToRad(portalData.rotation) + 'rad)';
		}

		// add click event handler
		wrapper.addEventListener('click', (e) => {
			let hotspot = Hotspots.getHotspot(e.currentTarget.getAttribute("hotspotId"));
			if (hotspot) {
				Panoramas.switchToPanorama(
					Panoramas.findPanoramaByID(hotspot.data.target),
					{
						yaw: hotspot.data.targetYaw,
						preserveOrientationBetweenPanoramas: hotspot.data.preserveOrientationBetweenPanoramas || false
					},
				);
			}
		});

		// create tooltip element
		var tooltip = document.createElement('div');
		tooltip.id = "portal-tooltip-" + portalData._id;
		tooltip.classList.add('link-hotspot-tooltip');

		let panorama = Panoramas.findPanoramaByID(portalData.target);
		tooltip.innerText = (panorama && panorama.data) ? panorama.data.name : "Unknown!";

		wrapper.appendChild(icon);
		wrapper.appendChild(tooltip);

		return wrapper;
	}

	/**
	 * Edit an existing hotspot of this hotspot type with the provided hotspot data.
	 * @method edit
	 * @static
	 * @param {Object} data The data with the changes to edit the hotspot with. Includes the id of the hotspot that is supposed to be edited.
	 */
	static edit(data) {
		let hotspot = Hotspots.getHotspot(data._id);

		if (!hotspot) {
			return;
		}

		let panorama = Panoramas.findPanoramaByID(data.target);
		hotspot.htmlElement.querySelector('#portal-tooltip-' + data._id).innerText = (panorama && panorama.data) ? panorama.data.name : "Unknown!";
		let icon = hotspot.htmlElement.querySelector('#portal-icon-' + data._id);
		for (let property of ['-ms-transform', '-webkit-transform', 'transform']) { // TODO animate change
			icon.style[property] = 'rotate(' + Main.degToRad(data.rotation) + 'rad)';
		}
	}

}