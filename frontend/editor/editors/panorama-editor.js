import Main				from 'frontend/main';
import BackendAPI		from 'frontend/http/backend-api';
import Hotspots			from 'frontend/marzipano/hotspots';
import Panoramas		from 'frontend/marzipano/panoramas';
import PanoramaList		from 'frontend/menus/panorama-list';

import EditorSidebar	from 'editor/menus/editor-sidebar';
import ContextMenu		from 'editor/menus/context-menu';
import UploadMenu		from 'editor/menus/upload-menu';

import Migration		from 'editor/migration';

/**
 * This static class is all about creating, editing and deleting panoramas for the editor.
 * @class PanoramaEditor
 * @static
 */
export default class PanoramaEditor {

	/**
	 * Sets up editor context menu entries for adding, editing and exporting panoramas.
	 * @method setup
	 * @static
	 */
	static setup() {

		ContextMenu.addOption(
			"Add Panorama",
			() => {
				if (state.tempData.disableInteraction) {
					return;
				}
				UploadMenu.open();
			}
		);

		ContextMenu.addOption(
			"Edit Panorama",
			() => {
				if (state.tempData.disableInteraction) {
					return;
				}
				EditorSidebar.openPanoramaEditorMenu();
				
			},
			true
		);

		ContextMenu.addOption(
			"Export Database",
			() => {
				if (state.tempData.disableInteraction) {
					return;
				}
				Migration.exportJSON();
			},
			true
		);
	}

	/**
	 * Get information about the editable document fields.
	 * @method getEditableValues
	 * @static
	 * @return A collection of panorama document fields with information about their name, type, display name and optional bounds.
	 */
	static getEditableValues() {
		return {
			"name":			{ type: "text"			, label: "Name"				},
			"location":		{ type: "locationPicker", label: "Location"			},
			"yaw":			{ type: "buttonYawMenu"	, label: "InitialYaw"		},
			"orientation":	{ type: "orientation"	, label: "Orientation"		},
			// "poiRadius":	{ type: "range"			, label: "POI Radius",	min: 1, max:	25, step: 1	},
			"isStart":		{ type: "checkbox"		, label: "isStart"			},
			"isIndoors":	{ type: "checkbox"		, label: "isIndoors"		},
			"building":		{ type: "text"			, label: "Building"			},
			"floor":		{ type: "range"			, label: "Floor",		min: -10, max: 30, step: 1 },
			"room":			{ type: "text"			, label: "Room"				}
		};
	}
	
	/**
	 * Creates a new panorama on the backend server.
	 * @method create
	 * @static
	 * @param {Object} images A object with the cubemap side as key and the image blob as value.
	 * @param {Number} widthAndHeight The width and height of one cubemap face. Since the image is quadratic the height and width are the same.
	 * @param {String} originalImageFileName The original image file name. Used to initialize the name of the newly created panorama with.
	 */
	static create(images, widthAndHeight, originalImageFileName) {
		BackendAPI.createNewPanorama(
			images,
			widthAndHeight,
			originalImageFileName,
			(responseData) => {
				PanoramaEditor.createPanorama(responseData.panorama);
				
				// close and cleanup upload menu
				UploadMenu.close();
				state.htmlElements.uploadMenuFileInput.disabled = false;
				state.htmlElements.uploadMenuFileInput.value = null;

				state.htmlElements.uploadMenuFileInputCubeMap.up.disabled = false;
				state.htmlElements.uploadMenuFileInputCubeMap.down.disabled = false;
				state.htmlElements.uploadMenuFileInputCubeMap.front.disabled = false;
				state.htmlElements.uploadMenuFileInputCubeMap.back.disabled = false;
				state.htmlElements.uploadMenuFileInputCubeMap.right.disabled = false;
				state.htmlElements.uploadMenuFileInputCubeMap.left.disabled = false;
				state.htmlElements.uploadMenuFileInputCubeMap.up.value = null;
				state.htmlElements.uploadMenuFileInputCubeMap.down.value = null;
				state.htmlElements.uploadMenuFileInputCubeMap.front.value = null;
				state.htmlElements.uploadMenuFileInputCubeMap.back.value = null;
				state.htmlElements.uploadMenuFileInputCubeMap.right.value = null;
				state.htmlElements.uploadMenuFileInputCubeMap.left.value = null;
				
				while (state.htmlElements.uploadMenuCubeMapFaces.firstChild) {
					state.htmlElements.uploadMenuCubeMapFaces.removeChild(state.htmlElements.uploadMenuCubeMapFaces.firstChild);
				}
				if (state.htmlElements.uploadMenuLoadingCircle.classList.contains('visible')) {
					state.htmlElements.uploadMenuLoadingCircle.classList.remove('visible');
				}
			},
			(error) => {
				console.error(error);
			}
		);
	}
	
	/**
	 * Update an existing panorama on the backend server.
	 * @method update
	 * @static
	 * @param {Object} data The panorama data used to update the panorama document.
	 */
	static update(data) {
		BackendAPI.updatePanorama(
			data,
			(responseData) => {
				PanoramaEditor.updatePanorama(responseData.panorama);
			},
			(error) => {
				console.error(error);
			}
		);
	}
	
	/**
	 * Deletes an existing panorama by its id on the backend server.
	 * @method delete
	 * @static
	 * @param {String} id The id of the panorama to delete
	 */
	static delete(id) {
		BackendAPI.deletePanorama(
			id,
			(responseData) => {
				if (responseData.deleted) {
					PanoramaEditor.deletePanorama(id);
				}
			},
			(error) => {
				console.error(error);
			}
		);
	}


	/**
	 * Setup a panorama on the frontend with the provided data and switch to it.
	 * @method createPanorama
	 * @static
	 * @param {Object} panoramaData The panorama data.
	 */
	static createPanorama(panoramaData) {
		let panorama = Panoramas.createPanorama(panoramaData);
		state.panoramasByID[panorama.data._id] = panorama;

		PanoramaList.refresh();
		Panoramas.switchToPanorama(panorama);
		
		setTimeout(() => {
			EditorSidebar.openPanoramaEditorMenu();
		}, 50);
	}

	/**
	 * Updates an existing panorama on the frontend with the provided data. Destroys the current Marzipano scene and re-creates a new one with the new panorama data.
	 * @method updatePanorama
	 * @static
	 * @param {Object} panoramaData The panorama data.
	 */
	static updatePanorama(panoramaData) {
		EditorSidebar.close();

		let viewParameters = {
			viewParameters: 0,
			yaw: Main.radToDeg(state.currentPanorama.scene.view().yaw()) - panoramaData.orientation,
			pitch: Main.radToDeg(state.currentPanorama.scene.view().pitch())
		}

		// delete old
		state.viewer.destroyScene(Panoramas.findPanoramaByID(panoramaData._id).scene);
		delete state.panoramasByID[panoramaData._id];

		// create updated one
		let panorama = Panoramas.createPanorama(panoramaData);
		state.panoramasByID[panorama.data._id] = panorama;

		// add hotspots again
		Hotspots.addAllHotspotsToPanorama(panorama.data);

		PanoramaList.refresh();
		Panoramas.switchToPanorama(panorama, viewParameters);
	}

	/**
	 * Deletes a panorama on the frontend by removing the Marzipano scene.
	 * @method deletePanorama
	 * @static
	 * @param {Object} panoramaID The id of the panorama to delete.
	 */
	static deletePanorama(panoramaID) {
		EditorSidebar.close();

		state.viewer.destroyScene(Panoramas.findPanoramaByID(panoramaID).scene);
		delete state.panoramasByID[panoramaID];
		PanoramaList.refresh();
		Panoramas.openStartPanorama();
	}
}