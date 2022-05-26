import Hotspots		from 'frontend/marzipano/hotspots';

/**
 * The hotspot type to create and edit TextInfo hotspot with.
 * The TextInfo hotspot is used to display a panel with a title and text in the panorama.
 * @class TextInfo
 * @static
 */
export default class TextInfo {

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
		wrapper.classList.add('info-hotspot');
		wrapper.setAttribute("hotspotId", hotspotData._id);

		// create hotspot/tooltip header
		var header = document.createElement('div');
		header.classList.add('info-hotspot-header');

		// create image element
		var iconWrapper = document.createElement('div');
		iconWrapper.classList.add('info-hotspot-icon-wrapper');
		var icon = document.createElement('img');
		icon.src = 'img/info.png';
		icon.classList.add('info-hotspot-icon');
		iconWrapper.appendChild(icon);

		// create title element
		var titleWrapper = document.createElement('div');
		titleWrapper.classList.add('info-hotspot-title-wrapper');
		var title = document.createElement('div');
		title.id = "hotspot-title-" + hotspotData._id;
		title.classList.add('info-hotspot-title');
		title.innerText = hotspotData.title;
		titleWrapper.appendChild(title);

		// create close element
		var closeWrapper = document.createElement('div');
		closeWrapper.classList.add('info-hotspot-close-wrapper');
		var closeIcon = document.createElement('img');
		closeIcon.src = 'img/close.png';
		closeIcon.classList.add('info-hotspot-close-icon');
		closeWrapper.appendChild(closeIcon);

		// construct header element
		header.appendChild(iconWrapper);
		header.appendChild(titleWrapper);
		header.appendChild(closeWrapper);

		// create text element
		var text = document.createElement('div');
		text.id = "hotspot-text-" + hotspotData._id;
		text.classList.add('info-hotspot-text');
		text.innerText = hotspotData.text;

		// place header and text into wrapper element
		wrapper.appendChild(header);
		wrapper.appendChild(text);

		// create a modal for the hotspot content to appear on mobile mode
		var modal = document.createElement('div');
		modal.innerHTML = wrapper.innerHTML;
		modal.classList.add('info-hotspot-modal');
		document.body.appendChild(modal);

		var toggle = function () {
			wrapper.classList.toggle('visible');
			modal.classList.toggle('visible');
		};

		// show content when hotspot is clicked
		wrapper.querySelector('.info-hotspot-header').addEventListener('click', toggle);

		// hide content when close icon is clicked
		modal.querySelector('.info-hotspot-close-wrapper').addEventListener('click', toggle);

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
		
		hotspot.htmlElement.querySelector('#hotspot-title-' + data._id).innerHTML = data.title;
		hotspot.htmlElement.querySelector('#hotspot-text-' + data._id).innerHTML = data.text;
	}
	
}