import BackendAPI	from 'frontend/http/backend-api';

/**
 * This static class draws outlines of buildings and their rooms on Leaflet maps.
 * @class BuildingOutlinesPainter
 * @static
 */
export default class BuildingOutlinesPainter {
	
	/**
	 * Draws the outlines of the rooms of the building on the map.
	 * @method drawBuildingOutlinesToMap
	 * @static
	 * @param {Object} mapData The data about the map that the building outlines is supposed to be displayed in.
	 * @param {Boolean} isIndoors If the panorama is indoors.
	 * @param {Object} buildingName The name of the building to draw the outlines for.
	 * @param {Number} buildingFloor The floor of the building to draw the outlines for.
	 */
	static drawBuildingOutlinesToMap(mapData, isIndoors, buildingName, buildingFloor) {
		if (!isIndoors || buildingName === "") { // with no building data present, only add tile layer
			mapData.currentBuilding = {};

			if (mapData.buildingLayer) { // remove the existing building layer
				mapData.map.removeLayer(mapData.buildingLayer);
				mapData.buildingLayer = undefined;
			}

			if (mapData.tileLayer) { // tile layer already present
				return;
			}

			let tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
				maxZoom: 22,
				maxNativeZoom: 19
			});
			mapData.tileLayer = tileLayer;
			tileLayer.addTo(mapData.map);
			mapData.currentBuilding.name = "";

			return; 
		}

		if (isIndoors && mapData.currentBuilding && mapData.currentBuilding.name === buildingName && mapData.currentBuilding.floor === buildingFloor) { // skip if nothing changed
			return;
		}
		
		if (mapData.buildingLayer) { // remove the existing building layer
			mapData.map.removeLayer(mapData.buildingLayer);
			mapData.buildingLayer = undefined;
		}

		if (!isIndoors) {
			return;
		}

		const updateBuildingOutlines = (buildingData) => {
			// check if floor data exists
			let floorExists = false;
			for (let level of buildingData.levels) {
				if (level.level === buildingFloor) {
					floorExists = true;
					break;
				}
			}
			if (!floorExists) { 
				console.log("No building data for floor '" + buildingFloor + "' available!");
				return;
			}

			// create building polygons
			let polygons = [];
			buildingData.levels[buildingFloor].rooms.forEach(room => {
				let points = [];
				room.points.forEach((point) => {
					points.push([point.lat, point.lng]);
				});
				polygons.push(L.polygon(points, {interactive: false}));
			});

			// add building layer
			let buildingLayer = L.layerGroup(polygons);
			buildingLayer.addTo(mapData.map);

			// save changes
			mapData.buildingLayer = buildingLayer;
			mapData.currentBuilding =  { name: buildingName, floor: buildingFloor };
		}

		// retrieve building visuals, either from cache or requested from backend server
		if (state.cache.buildings[buildingName]) {
			if (typeof state.cache.buildings[buildingName] !== 'string') { // if it was not yet loaded
				updateBuildingOutlines(state.cache.buildings[buildingName]); // reuse cached building data
			}
		} else {
			state.cache.buildings[buildingName] = "loading";
			BackendAPI.getCMDBuildingInfo(
				buildingName,
				(building) => {
					state.cache.buildings[buildingName] = building; // cache building data for later use
					updateBuildingOutlines(building);
				},
				(error) => {
					state.cache.buildings[buildingName] = undefined;
					mapData.currentBuilding = {};
					console.log("No building data for " + buildingName);
				},
			);
		}
	}

}