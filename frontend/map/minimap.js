import Main from 'frontend/main';

import BuildingOutlinesPainter	from 'frontend/map/building-outlines-painter';

import L from 'leaflet';
import 'leaflet-rotatedmarker';


/**
 * This static class provides a minimap for the user which can be toggled on and off.
 * Also provides room outlines of the current building as well as a marker at the location of the current panorama.
 * @class Minimap
 * @static
 */
export default class Minimap {


	/**
	 * Initializes the minimap.
	 * @method setup
	 * @static
	 */
	static setup() {

		state.minimap = {
			currentBuilding: {}
		};

		state.htmlElements.minimapToggle.addEventListener('click', Minimap.toggle);

		const ZOOM_LEVEL = 20;
		var map = L.map('minimap', {
			minZoom: ZOOM_LEVEL-2,
			maxZoom: ZOOM_LEVEL
		}).setView([50.5870138, 8.6817569], document.body.classList.contains('mobile') ? ZOOM_LEVEL-1 : ZOOM_LEVEL);

		let tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: 22,
			maxNativeZoom: 19
		}).addTo(map);

		state.minimap.tileLayer = tileLayer;
		state.minimap.map = map;

		// rotate marker
		state.viewer.addEventListener('viewChange', () => {
			if (state.currentPanorama && state.minimap.marker) {
				state.minimap.marker.setRotationAngle(Main.radToDeg(state.currentPanorama.scene.view().yaw()) - state.currentPanorama.data.orientation);
			}
		})
	}

	/**
	 * Updates the minimap based on the panorama provided.
	 * @method update
	 * @static
	 * @param {Object} panorama The panorama to update the minimap with.
	 */
	static update(panorama) {
		// remove old markers if present
		if(state.minimap.marker) {
			state.minimap.map.removeLayer(state.minimap.marker);
		}
		if(state.minimap.poiMarkers) {
			state.minimap.map.removeLayer(state.minimap.poiMarkers);
		}
		
		// update building visuals
		BuildingOutlinesPainter.drawBuildingOutlinesToMap(state.minimap, panorama.data.isIndoors, panorama.data.building, panorama.data.floor);
		
		// create marker
		let location = [panorama.data.lat, panorama.data.lng];
		var markerIcon = L.icon({
			iconUrl: 'marker.png',
			iconSize: [21, 21],
			iconAnchor: [11, 11],
			popupAnchor: [-5, -50]
		});
		let marker = L.marker(location, { icon: markerIcon, interactive: false });

		marker.setRotationOrigin('center center');
		marker.setRotationAngle(Main.radToDeg(state.currentPanorama.scene.view().yaw()) - state.currentPanorama.data.orientation);

		state.minimap.marker = marker;
		state.minimap.map.addLayer(marker);

		// center map to current location
		state.minimap.map.setView(location)

		// add poi markers
		if (state.currentPanorama.pois) {
			let poiMarkers = [];
			for (let poi of state.currentPanorama.pois) {
				let poiLocation = [poi.latitude, poi.longitude];
				let poiMarker = L.circle(poiLocation, {
					color: '#80ba24',
					fillColor: '#80ba24',
					fillOpacity: 1,
					radius: 0.25
				});
				let name = poi.name || "Point of Interest";
				let tooltipText = name;
				if (poi.category && poi.category.stringAttributes && poi.category.stringAttributes.fontAwesomeIcon) {
					tooltipText = <span><i class={poi.category.stringAttributes.fontAwesomeIcon}/> {name}</span>;
				}
				poiMarker = poiMarker.bindTooltip(tooltipText, { direction: 'top', offset: [0, -10]});
				poiMarkers.push(poiMarker);
			}
			state.minimap.poiMarkers = L.layerGroup(poiMarkers);
			state.minimap.poiMarkers.addTo(state.minimap.map)
		}
	}

	/**
	 * Opens the minimap.
	 * @method open
	 * @static
	 */
	static open() {
		state.htmlElements.minimap.classList.add('enabled');
		state.htmlElements.minimapToggle.classList.add('enabled');
	}
	
	/**
	 * Closes the minimap.
	 * @method close
	 * @static
	 */
	static close() {
		state.htmlElements.minimap.classList.remove('enabled');
		state.htmlElements.minimapToggle.classList.remove('enabled');
	}
	
	/**
	 * Toggles the minimap.
	 * @method toggle
	 * @static
	 */
	static toggle() {
		state.htmlElements.minimap.classList.toggle('enabled');
		state.htmlElements.minimapToggle.classList.toggle('enabled');
	}
	

}