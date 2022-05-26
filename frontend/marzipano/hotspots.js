import Main				from 'frontend/main';
import Panoramas    	from 'frontend/marzipano/panoramas';
import Minimap			from 'frontend/map/minimap';
import BackendAPI 		from 'frontend/http/backend-api';
import Controls			from 'frontend/others/controls';

import HotspotEditor	from 'editor/editors/hotspot-editor';

import AngleCalculator	from 'frontend/utils/angle-calculator';


/**
 * This static class provides functionality for Marzipano hotspots. Hotspots can be created and via id returned or deleted.
 * @class Hotspots
 * @static
 */
export default class Hotspots {

	/**
	 * Creates all hotspots for all marzipano panorama scenes.
	 * @method initHotspots
	 * @static
	 * @param {Array} panoramasDocuments The array with the panorama documents as its entries.
	 */
	static initHotspots(panoramaDocuments) {
		return panoramaDocuments.map((panoramaData) => {
			Hotspots.addAllHotspotsToPanorama(panoramaData);
		});
	}

	/**
	 * Creates and adds all hotspots for a specific amrzipano panorama scene.
	 * @method addAllHotspotsToPanorama
	 * @static
	 * @param {Object} panoramaData The data of the panorama.
	 */
	static addAllHotspotsToPanorama(panoramaData) {
		panoramaData.hotspots.forEach((hotspot) => {
			if (!hotspot.type) {
				console.error("No hotspot type set!");
				return;
			}
			if (!state.hotspotTypes[hotspot.type]) {
				console.error("Unknown hotspot type: " + hotspot.type);
				return;
			}
			
			Hotspots.addHotspotToPanorama(panoramaData._id, hotspot);
		});
	}

	/**
	 * Loads POIs from backend for the panorama as well as all via portal hotspots connected panoramas.
	 * Caches the loaded pois in the data object of the panorama.
	 * @method loadPOIsForPanorama
	 * @static
	 * @param {Object} panoramaOriginal The panorama object with data and scene. 
	 */
	static loadPOIsForPanorama(panoramaOriginal) {
		let thisAndConnectedPanoramas = [];
		if (!panoramaOriginal.pois) {
			thisAndConnectedPanoramas.push(panoramaOriginal);
		}
		for (let hotspot of panoramaOriginal.data.hotspots) {
			if (hotspot.type === "portal") {
				let panorama = state.panoramasByID[hotspot.target];
				if (panorama && !panorama.pois) {
					thisAndConnectedPanoramas.push(panorama);
				}
			}
		}
		
		// for (let panorama of thisAndConnectedPanoramas) {
		// 	// request backend POI information and insert POI hotspots
		// 	BackendAPI.getPOIData(
		// 		panorama.data.lat,
		// 		panorama.data.lng,
		// 		panorama.data.poiRadius || 10, // too high? too low? individualize per panorama?
		// 		panorama.data.floor,
		// 		(pois) => {
		// 			if (panorama.pois) { // already loaded
		// 				return;
		// 			}
		// 			panorama.pois = [];

		// 			pois.forEach((poi) => {
		// 				if (poi.levels.indexOf(panorama.data.floor) !== -1) {
		// 					// poi.yaw = AngleCalculator.calculateAngleOldForumla(panorama.data, poi);
		// 					poi.yaw = AngleCalculator.calculateAngle(panorama.data, poi);
		// 					panorama.pois.push(poi);
		// 				}
		// 			})

		// 			// some rudimentary overlapping avoidance solution, needs a proper implementation tho
		// 			panorama.pois.forEach((poi1) => {
		// 				panorama.pois.forEach((poi2) => {
		// 					if (poi1.uuid !== poi2.uuid) {
		// 						if (poi1.yaw >= poi2.yaw-3 && poi1.yaw <= poi2.yaw+3 && !poi2.pitchOffset) {
		// 							poi2.pitchOffset = -3;
		// 							poi1.pitchOffset = 0;
		// 						}
		// 					}
		// 				})
		// 			})

		// 			panorama.pois.forEach((poi) => {
		// 				Hotspots.addPOIasHotspotToPanorama(panorama.data, poi);
		// 			})

		// 			// only on the switched to panorama
		// 			if (panorama.data._id === panoramaOriginal.data._id && state.currentPanorama.data._id === panoramaOriginal.data._id) {
		// 				Minimap.update(panoramaOriginal);
		// 			}

					
		// 			// if (panorama.data.name !== "Eingangshalle") {
		// 			// 	return;
		// 			// }

		// 			// let hotspot = {
		// 			// 	name: "hotspot1 north",
		// 			// 	latitude: 50.617123,
		// 			// 	longitude: 8.681203
		// 			// }
		// 			// let hotspot2 = {
		// 			// 	name: "hotspot2 west",
		// 			// 	latitude: 50.586706,
		// 			// 	longitude: 8.644522
		// 			// }
		// 			// let hotspot3 = {
		// 			// 	name: "hotspot3 south",
		// 			// 	latitude: 50.561334,
		// 			// 	longitude: 8.681315
		// 			// }
		// 			// let hotspot4 = {
		// 			// 	name: "hotspot4 east",
		// 			// 	latitude: 50.587780,
		// 			// 	longitude: 8.728975
		// 			// }

		// 			// Hotspots.addPOIasHotspotToPanorama(panorama.data, hotspot);
		// 			// Hotspots.addPOIasHotspotToPanorama(panorama.data, hotspot2);
		// 			// Hotspots.addPOIasHotspotToPanorama(panorama.data, hotspot3);
		// 			// Hotspots.addPOIasHotspotToPanorama(panorama.data, hotspot4);
		// 		},
		// 		(error) => {
		// 			console.error(error);
		// 		})
		// }
	}
	

	/**
	 * Creates a POI as marzipano hotspots into the specified panorama scene.
	 * @method addPOIasHotspotToPanorama
	 * @static
	 * @param {Object} panoramaData The data of the panorama containing the scene to insert the POI hotspot into.
	 * @param {Object} poiData The POI data to create the marzipano hotspot from.
	 */
	static addPOIasHotspotToPanorama(panoramaData, poiData) {
		let difLat = panoramaData.lat-poiData.latitude;
		let difLng = panoramaData.lng-poiData.longitude

		// this is a big mess but uses the distance between panorama and poi to position and change the size of the hotspot to be higher/larger 
		let distance = Main.radToDeg(Math.sqrt(difLat*difLat + difLng*difLng) * 10000)/5;
		let size = 20.0-Math.max(Math.min(distance, 15.0), 0.0);
		let pitch = 10 - Math.max(Math.min(distance, 8.5), 0.0);

		let hotspotData = {
			type: "poi",
			yaw: poiData.yaw + panoramaData.orientation,
			pitch: pitch + (poiData.pitchOffset ? poiData.pitchOffset : 0),
			size: size
		};

		poiData = { ...poiData, ...hotspotData };
		Hotspots.addHotspotToPanorama(panoramaData._id, poiData);
	}
	
	/**
	 * Creates and adds a specific hotspot to a specific panorama scene.
	 * @method addHotspotToPanorama
	 * @static
	 * @param {String} panoramaID The id of the panorama to add the hotspot into.
	 * @param {Object} hotspot The data of the hotspot. 
	 */
	static addHotspotToPanorama(panoramaID, hotspot) {
		if (hotspot.type === "poi" && hotspot._id === undefined) {
			hotspot._id = "poi-" + hotspot.latitude + "-" + hotspot.longitude;
		}

		let hotspotType = Hotspots.getHotspotType(hotspot.type);
	
		let htmlElement = hotspotType.create(hotspot);
		htmlElement.setAttribute("hotspotType", hotspot.type);

		// prevent touch and scroll events from reaching the parent element
		// this prevents the view control logic from interfering with the hotspot
		Controls.stopTouchAndScrollEventPropagation(htmlElement);

		// add editor functionality of available
		HotspotEditor.addEventListenerEditorMenu(htmlElement);
	
		let marzipanoObject = Panoramas.findPanoramaByID(panoramaID).scene.hotspotContainer().createHotspot(
			htmlElement,
			{ yaw: Main.degToRad(hotspot.yaw), pitch: Main.degToRad(hotspot.pitch) }
		);

		
		state.hotspots[hotspot._id] = {
			panoramaID: panoramaID,
			data: hotspot,
			htmlElement: htmlElement,
			marzipanoObject: marzipanoObject
		}
	}

	
	/**
	 * Deletes the hotspots with the provided id.
	 * @method deleteHotspot
	 * @static
	 * @param {String} hotspotId The id of the hotspot to be deleted.
	 */
	static deleteHotspot(hotspotId) {
		let hotspot = Hotspots.getHotspot(hotspotId);
		
		if (!hotspot) {
			return;
		}
		
		Panoramas.findPanoramaByID(hotspot.panoramaID).scene.hotspotContainer().destroyHotspot(hotspot.marzipanoObject);
		hotspot.htmlElement.remove();
		delete state.hotspots[hotspotId];
	}
	

	/**
	 * Returns the hotspot information with the provided hotspot id.
	 * @method deleteHotspot
	 * @static
	 * @param {String} hotspotId The id of the hotspot to be returned.
	 * @return {Object} The object containing information about the hotspot.
	 */
	static getHotspot(hotspotId) {
		return state.hotspots[hotspotId];
	}

	/**
	 * Returns the static class of the provided hotspot type to create and edit a hotspot with that hotspot type.
	 * @method getHotspotType
	 * @static
	 * @param {String} hotspotType The name of the hotspot type.
	 * @return {Class} The static class with methods for creating and editing hotspots for that specific hotspot type.
	 */
	static getHotspotType(hotspotType) {
		return state.hotspotTypes[hotspotType];
	}
}