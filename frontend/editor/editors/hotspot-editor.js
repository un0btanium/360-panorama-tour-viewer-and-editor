
import BackendAPI		from 'frontend/http/backend-api';
import Hotspots			from 'frontend/marzipano/hotspots';

import EditorSidebar	from 'editor/menus/editor-sidebar';

/**
 * This static class is all about creating, editing and deleting hotspots.
 * @class HotspotEditor
 * @static
 */
export default class HotspotEditor {

	/**
	 * Sets up all hotspots with editor capabilities.
	 * @method setup
	 * @static
	 */
	static setup() {
		// init editor elements for each hotspot type
		Object.values(state.hotspotTypesEditor).forEach((hotspotTypeEditor) => {
			hotspotTypeEditor.setup();
		})
	}

	/**
	 * Creates a new hotspot on the current marzipano panorama scene based on the provided hotspot type.
	 * @method create
	 * @static
	 * @param {String} hotspotType The name of the hotspot type.
	 */
	static create(hotspotType) {
		let panoramaId = state.currentPanorama.data._id;
		let hotspotData = HotspotEditor.getHotspotType(hotspotType).getInitialData();
		BackendAPI.createNewHotspot(
			panoramaId,
			hotspotData,
			(responseData) => {
				Hotspots.addHotspotToPanorama(panoramaId, responseData.hotspot);
			},
			(error) => {
				console.error(error);
				// TODO display error message to user
			}
		);
	}
	
	/**
	 * Update an existing hotspot.
	 * @method update
	 * @static
	 * @param {Object} data The hotspot data. Contains the id of the hotspot.
	 * @param {Boolean} [closeMenues=true] If set to true, closes the editor sidebar on successful update.
	 */
	static update(data, closeMenues=true) {
		BackendAPI.updateHotspot(
			data,
			(responseData) => {
				Hotspots.getHotspotType(responseData.hotspot.type).edit(responseData.hotspot);
				state.hotspots[responseData.hotspot._id].data = responseData.hotspot;
				if (closeMenues) {
					EditorSidebar.close();
				}
			},
			(error) => {
				console.error(error);
				// TODO
			}
		)
	}

	/**
	 * Delete an existing hotspot by its id.
	 * @method delete
	 * @static
	 * @param {String} id The id of the hotspot to delete.
	 */
	static delete(id) {
		BackendAPI.deleteHotspot(
			id,
			(data) => {
				if (data.deleted) {
					EditorSidebar.close();
					Hotspots.deleteHotspot(data._id);
				} else {
					// TODO
				}
			},
			(error) => {
				console.error(error);
				// TODO
			}
		);
	}

	/**
	 * Adds the functionality to the hotspot html element to open the hotspot editor when right-clicking on it.
	 * @method addEventListenerEditorMenu
	 * @static
	 * @param {HTMLElement} hotspotHtmlElement The hotspot html element.
	 */
	static addEventListenerEditorMenu(hotspotHtmlElement) {
		hotspotHtmlElement.addEventListener("contextmenu", (e) => {
			e.stopPropagation();
			e.preventDefault();

			if (!state.settings.editorEnabled) {
				return;
			}

			if (state.tempData.disableInteraction) {
				return;
			}
				
			if (hotspotHtmlElement.classList.contains('poi-hotspot')) {
				return;
			}

			let id = hotspotHtmlElement.getAttribute("hotspotId");

			if (!id) { return; }
			
			EditorSidebar.openHotspotEditorMenu(id);
		});
	}

	/**
	 * Updates the target yaw of all portal hotspots which have the updated panorama as target and if the orientation was changed.
	 * @method updateHotspotTargetYaws
	 * @static
	 * @param {Object} oldPanoramaData The old panorama data.
	 * @param {Object} newPanoramaData The new, updated panorama data.
	 */
	static updateHotspotTargetYaws(oldPanoramaData, newPanoramaData) {
		if (oldPanoramaData._id !== newPanoramaData._id) { return; }
		if (oldPanoramaData.orientation === newPanoramaData.orientation) { return; }

		let offset = oldPanoramaData.orientation - newPanoramaData.orientation;
		for (let hotspotId in state.hotspots) {
			let hotspot = state.hotspots[hotspotId];
			if (hotspot.data.type !== "portal") { continue; }
			if (hotspot.data.target !== newPanoramaData._id) { continue; }

			hotspot.data.targetYaw = hotspot.data.targetYaw + offset;
			HotspotEditor.update(hotspot.data, false);
		}

	}

	/**
	 * Returns the static class associated with the hotspot type name holding the information on how to create and edit hotspots of this type.
	 * @method getHotspotType
	 * @static
	 * @param {String} hotspotType The name of the hotspot.
	 * @return {Class} The static class containing information how to create and update hotspots of this type.
	 */
	static getHotspotType(hotspotType) {
		return state.hotspotTypesEditor[hotspotType];
	}

}