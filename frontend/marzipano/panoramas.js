import Main		 		from 'frontend/main';
import Hotspots			from 'frontend/marzipano/hotspots';
import PanoramaList		from 'frontend/menus/panorama-list';
import DetailSidebar	from 'frontend/menus/detail-sidebar';
import Minimap 			from 'frontend/map/minimap';
import Autorotation		from 'frontend/others/autorotate';

import Marzipano		from 'marzipano';

/**
 * This static class allows the creation of Marzipano panorama scenes.
 * Panoramas can be queried by their MongoDB unique id.
 * Functions are provided that allow switching to a certain panorama as well as changing the panorama name in the UI and selecting a start panorama.
 * @class Panoramas
 * @static
 */
export default class Panoramas {
	
	/**
	 * Initializes all panoramas by creating the Marzipano viewer and adding Marzipano panorama scenes to it based on the provided panorama documents.
	 * @method setup
	 * @static
	 * @param {Array} panoramaDocuments The panorama documents.
	 */
	static setup(panoramaDocuments) {
		// create Marzipano viewer
		let viewerOptions = {
			controls: {
				mouseViewMode: "drag"
			},
			// Use progressive rendering to produce a more pleasing visual effect when
			// zooming past several resolution levels, at the cost of additional bandwidth consumption.
			stage: {
				progressive: !document.body.classList.contains("mobile") // only on desktop
			}
		};
		state.viewer = new Marzipano.Viewer(state.htmlElements.pano, viewerOptions)

		// create Marzipano panorama scenes
		panoramaDocuments = panoramaDocuments.sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
		let panoramas = panoramaDocuments.map(Panoramas.createPanorama);
		
		state.panoramasByID = {};
		for (let panorama of panoramas) {
			state.panoramasByID[panorama.data._id] = panorama;
		}
	}

	/**
	 * Creates a new marzipano scene based on the provided panorama document data.
	 * @method createPanorama
	 * @static
	 * @param {Object} panoramaData The panorama document to create a new marzipano scene from.
	 * @return {Object} The new panorama object containing the marzipano scene and the panorama document data the scene was created from (plus an empty array for holding points-of-interests).
	 */
	static createPanorama(panoramaData) {
		const getFaceName = (z) => { return { l: "left", f: "front", r: "right", b: "back", u: "up", d: "down" }[z]; };
		const getTileUrl = (panoramaImageId, f, level, x, y) => "cubemaps/" + panoramaImageId + "/" + level + "/" + getFaceName(f) + "/tile-" + x + "-" + y + ".jpg";
		
		let source = new Marzipano.ImageUrlSource((tile) => {
			return { url: getTileUrl(panoramaData._id, tile.face, tile.z, tile.x, tile.y) };
		});
		
		const levels = panoramaData.cubemapLevels;
		const maxResolution = levels[levels.length-1].size;
		const fov = Main.degToRad(110);

		let geometry = new Marzipano.CubeGeometry(levels);
		let limiter = Marzipano.RectilinearView.limit.traditional(maxResolution, fov);
		let view = new Marzipano.RectilinearView({ fov: fov }, limiter);
		
		let scene = state.viewer.createScene({
			source: source,
			geometry: geometry,
			view: view,
			pinFirstLevel: true // state.settings.preloadAllPanoramaImages // if true preloads all panorama images on startup (slower startup, but no transition animation because of long load time)
		});
		
		let panorama = {
			data: panoramaData,
			scene: scene
		};

		return panorama;
	}


	/**
	 * Searches for a panorama by its unique id.
	 * @method findPanoramaByID
	 * @static
	 * @param {String} panoramaID The panorama id.
	 * @return {Object} The panorama object containing the panorama document and marzipano scene.
	 */
	static findPanoramaByID(panoramaID) {
		return state.panoramasByID[panoramaID];
	}

	
	/**
	 * Switches from the current panorama to the provided panorama. Also updates related UI elements like the panorama list and panorama name.
	 * @method switchToPanorama
	 * @static
	 * @param {Object} panorama The panorama object containing the marzipano scene to switch to.
	 * @param {Object} [viewParameters={}] Optional view parameters that are provided to the viewer on scene switch (yaw, pitch, fov and transition duration).
	 */
	static switchToPanorama(panorama, viewParameters={}) {
		if (state.tempData.disableInteraction) {
			return;
		}

		let previousPanorama = state.currentPanorama;
		state.currentPanorama = panorama;

		Autorotation.stop();

		// default fallback view parameters
		let initialViewParameters = {
			yaw: 0,
			pitch: 5,
			fov: 110
		}

		// default panorama data view parameters
		let sceneInitialViewParameters = {};
		if (panorama.data.yaw) {
			sceneInitialViewParameters.yaw = panorama.data.yaw;
		}
		if (panorama.data.pitch) {
			sceneInitialViewParameters.pitch = panorama.data.pitch;
		}
		if (panorama.data.fov) {
			sceneInitialViewParameters.fov = panorama.data.fov;
		}
		initialViewParameters = {...initialViewParameters, ...sceneInitialViewParameters, ...viewParameters};
		
		// preserve orientations from previous panorama (factor in offset from compass orientation relative to north)
		if (previousPanorama && viewParameters.preserveOrientationBetweenPanoramas) {
			let previousViewParameters = previousPanorama.scene.view().parameters();
			initialViewParameters.yaw = Main.radToDeg(previousViewParameters.yaw) - previousPanorama.data.orientation;
			initialViewParameters.pitch = Main.radToDeg(previousViewParameters.pitch);
		}
		
		// convert view parameters to rad
		initialViewParameters = {
			yaw:	Main.degToRad(initialViewParameters.yaw + panorama.data.orientation),
			pitch:	Main.degToRad(initialViewParameters.pitch),
			fov:	Main.degToRad(initialViewParameters.fov),
		}

		panorama.scene.view().setParameters(initialViewParameters);
		panorama.scene.switchTo({ transitionDuration: viewParameters.transitionDuration !== undefined ? viewParameters.transitionDuration : state.settings.panoramaTransitionDuration });
		
		DetailSidebar.close();
		Autorotation.start();
		Panoramas.updatePanoramaName(panorama);
		PanoramaList.update(panorama);
		Hotspots.loadPOIsForPanorama(panorama);
		Minimap.update(panorama);
	}
	

	/**
	 * Determines the panorama that the application is supposed to be showing on first startup.
	 * The start panorama is determined by the 'isStart' property in the panorama data, by the 'startPanorama' id as url parameter or via 'longitude', 'latitude' and 'floor' url parameters based on the closest panorama to that location.
	 * @method openStartPanorama
	 * @static
	 */
	static openStartPanorama() {
		let panoramas = Object.values(state.panoramasByID);
		let startPanorama = panoramas.length > 0 ? panoramas[0] : undefined; // TODO what happens on no scenes existing?

		// parse url params
		var urlParams = {};
		window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
			urlParams[key] = value;
		});
	
		// determine starting panorama based on panorama data 'isStart' entry (overwrites previous)
		for (let panorama of panoramas) {
			if (panorama.data.isStart) {
				startPanorama = panorama;
			}
		}
	
		// determine starting panorama based on 'startPanorama' url parameter (overwrites previous)
		if (urlParams['startPanorama']) {
			let panorama = Panoramas.findPanoramaByID(urlParams['startPanorama'])
			if (panorama) {
				startPanorama = panorama;
			}
		}
	
		// determine starting panorama based on 'latitude' and 'longitude' and 'floor' url parameters and the closest panorama to that coord (overwrites previous)
		if (urlParams['latitude'] && urlParams['longitude']) {
			const latitude = Main.degToRad(parseFloat(urlParams['latitude']));
			const longitude = Main.degToRad(parseFloat(urlParams['longitude']));
			const floor = parseInt(urlParams['floor'] || 0);

			const earthRadius = 6371; // in km
			let closestPanorama = { panorama: undefined, distance: 999999 };
			for (let panorama of panoramas) {
				if (!panorama.data) {
					continue;
				}
				if (panorama.data.floor !== floor) {
					continue;
				}
				const panoramaLatitude = Main.degToRad(panorama.data.lat);
				const panoramaLongitude = Main.degToRad(panorama.data.lng);
				
				const dlat = panoramaLatitude - latitude;
				const dlng = panoramaLongitude - longitude;
				
				const a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(panoramaLongitude) * Math.cos(latitude) * Math.pow(Math.sin(dlng / 2), 2);
				const c = 2 * Math.asin(Math.sqrt(a));

				const distance = c * earthRadius;
				
				if (distance < closestPanorama.distance) {
					closestPanorama = {
						panorama: panorama,
						distance: distance
					}
				}
			}
			if (closestPanorama.panorama) {
				startPanorama = closestPanorama.panorama;
			}
		}

		if (startPanorama) {
			Panoramas.switchToPanorama(startPanorama);
		} else {
			// TODO what happens when no panoramas exist yet? show add panorama editor screen (if enabled, error message otherwise)?
		}
	}

	/**
	 * Changes the name displayed to the name of the provided panorama.
	 * @method updatePanoramaName
	 * @static
	 * @param {Object} panorama The panorama object whichs name is supposed to be displayed instead of the current one.
	 */
	static updatePanoramaName(panorama) {
		let title = "";
		if (panorama.data.isIndoors && panorama.data.building) {
			title += panorama.data.building + "." + panorama.data.floor + " - " + panorama.data.room;
		} else {
			title = panorama.data.name;
		}
		state.htmlElements.panoramaName.innerText = title;
	}

}