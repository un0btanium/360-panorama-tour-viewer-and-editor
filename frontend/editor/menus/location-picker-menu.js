import BuildingOutlinesPainter	from 'frontend/map/building-outlines-painter';

import ContextMenu				from 'editor/menus/context-menu';	



/**
 * This static class provides a menu to pick a specific location from a map based on latitude and longitude.
 * @class LocationPickerMenu
 * @static
 */
export default class LocationPickerMenu {
	
	/**
	 * Initializes the location picker menu.
	 * @method setup
	 * @static
	 */
	static setup() {
		document.body.appendChild(
			<div id="location-picker-menu" class="location-picker-menu">
				<div class="editor-item-list-container">
					<div class="editor-item-element-row">
						<div class="editor-item-element-large">
							<div class="editor-header-text">Select the location for the panorama!</div>
						</div>
					</div>
					<div class="editor-item-element-row">
						<div class="editor-item-element-small">
							<button id="location-picker-cancel-button" class="cancel-button">Cancel</button>
						</div>
						<div class="editor-item-element-large">
							<button id="location-picker-apply-button" class="apply-button">Select</button>
						</div>
					</div>
				</div>
				<div id="location-picker-map" class="location-picker-map">
					{/* <!-- Automatically filled with content --> */}
				</div>
			</div>
		);

		state.htmlElements.locationPickerMenu = document.getElementById('location-picker-menu');

		document.getElementById('location-picker-apply-button').addEventListener('click', (e) => {
			e.preventDefault();
			let latLng = state.locationPicker.marker.getLatLng();
			state.tempData.locationPickerCallback(true, latLng.lat, latLng.lng);
			LocationPickerMenu.close();
		});

		document.getElementById('location-picker-cancel-button').addEventListener('click', (e) => {
			e.preventDefault();
			state.tempData.locationPickerCallback(false);
			LocationPickerMenu.close();
		});

		const ZOOM_LEVEL = 20;
		var map = L.map('location-picker-map', {
			minZoom: ZOOM_LEVEL-4,
			maxZoom: ZOOM_LEVEL
		}).setView([50.5870138, 8.6817569], ZOOM_LEVEL);
		
		L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: 22,
			maxNativeZoom: 19
		}).addTo(map);

		map.addEventListener('click', (e) => {
			state.locationPicker.marker.setLatLng(e.latlng);
		})

		let location = [50.5870138, 8.6817569];
		var marker = L.circle(location, {
			color: 'red',
			fillColor: '#f03',
			fillOpacity: 0.5,
			radius: 0.5
		});

		state.locationPicker = { map: map, marker: marker };
		state.locationPicker.map.addLayer(marker);
		state.locationPicker.map.invalidateSize();
	}

	/**
	 * Open the location picker menu.
	 * @method open
	 * @static
	 * @param {Boolean} isIndoors If the panorama was taken indoors.
	 * @param {String} buildingName The name of the building. Used to draw the building outlines from.
	 * @param {Number} buildingFloor The floor of the building. Used to draw the building outlines from.
	 * @param {Object} latLng The latitude and longitude values of the current position.
	 * @param {Function(Boolean, Number, Number)} callback The function to call once the location picker menu is closed. Returns a Boolean and if true, then it also returns the new latitude and longitude as a second and third parameter value.
	 */
	static open(isIndoors, buildingName, buildingFloor, latLng, callback) {
		state.tempData.locationPickerCallback = callback;

		state.locationPicker.marker.setLatLng(latLng);
		
		// update building visuals
		BuildingOutlinesPainter.drawBuildingOutlinesToMap(state.locationPicker, isIndoors, buildingName, buildingFloor);

		state.htmlElements.locationPickerMenu.classList.add("visible");
		state.locationPicker.map.invalidateSize();
		ContextMenu.close();

		state.tempData.disableInteraction = true;
	}

	/**
	 * Close the location picker menu.
	 * @method close
	 * @static
	 */
	static close() {
		state.tempData.disableInteraction = false;
		state.htmlElements.locationPickerMenu.classList.remove("visible");
	}
}