import Main    		from 'frontend/main';
import Panoramas    from 'frontend/marzipano/panoramas';

import ContextMenu	from 'editor/menus/context-menu';

/**
 * This static class provides a menu that lets the user select a yaw angle in a panorama by looking around the panorama.
 * @class YawSelectionMenu
 * @static
 */
export default class YawSelectionMenu {

	/**
	 * Sets up the yaw selection menu. Call only once on startup.
	 * @method setup
	 * @static
	 */
	static setup() {
		let editorSetTargetYawMenu = document.createElement('div');
		editorSetTargetYawMenu.id = "editor-set-target-yaw-menu";
		editorSetTargetYawMenu.classList.add('editor-editing-menu');
		document.body.appendChild(editorSetTargetYawMenu);

		let editorItemListContainer = document.createElement('div');
		editorItemListContainer.classList.add('editor-item-list-container');
		editorSetTargetYawMenu.appendChild(editorItemListContainer);


		let editorItemElementRow = document.createElement('div');
		editorItemElementRow.classList.add('editor-item-element-row');
		editorItemListContainer.appendChild(editorItemElementRow);

		let editorItemElementLarge = document.createElement('div');
		editorItemElementLarge.classList.add('editor-item-element-large');
		editorItemElementRow.appendChild(editorItemElementLarge);

		let editorHeaderText = document.createElement('div');
		editorHeaderText.classList.add('editor-header-text');
		editorHeaderText.innerText = "Rotate the camera into the desired position!";
		editorItemElementLarge.appendChild(editorHeaderText);

		
		let editorItemElementRow2 = document.createElement('div');
		editorItemElementRow2.classList.add('editor-item-element-row');
		editorItemListContainer.appendChild(editorItemElementRow2);

		let editorItemElementSmall = document.createElement('div');
		editorItemElementSmall.classList.add('editor-item-element-small');
		editorItemElementRow2.appendChild(editorItemElementSmall);

		let editorButtonCancel = document.createElement('button');
		editorButtonCancel.id = "target-yaw-editing-cancel-button";
		editorButtonCancel.classList.add('cancel-button');
		editorButtonCancel.innerText = "Cancel";
		editorItemElementSmall.appendChild(editorButtonCancel);

		let editorItemElementMedium = document.createElement('div');
		editorItemElementMedium.classList.add('editor-item-element-medium');
		editorItemElementRow2.appendChild(editorItemElementMedium);

		let editorButtonApply = document.createElement('button');
		editorButtonApply.id = "target-yaw-editing-apply-button";
		editorButtonApply.classList.add('apply-button');
		editorButtonApply.innerText = "Save";
		editorItemElementMedium.appendChild(editorButtonApply);

		let htmlEditingMenuElements = {
			editTargetYaw:		editorSetTargetYawMenu,
			targetYawApply:		editorButtonApply,
			targetYawCancel:	editorButtonCancel
		}
		state.htmlElements = {...state.htmlElements, ...htmlEditingMenuElements };

		state.htmlElements.targetYawApply.addEventListener('click', (e) => {
			e.preventDefault();
			state.tempData.targetYawCallback(true, (Main.radToDeg(state.currentPanorama.scene.view().yaw())-state.currentPanorama.data.orientation + 360) % 360);
			YawSelectionMenu.close();
		});

		state.htmlElements.targetYawCancel.addEventListener('click', (e) => {
			e.preventDefault();
			state.tempData.targetYawCallback(false);
			YawSelectionMenu.close();
		});
	}

	/**
	 * Open the yaw selection menu.
	 * @method open
	 * @static
	 * @param {String} panoramaID The id of the panorama to switch to.
	 * @param {Number} yaw The current yaw angle of the panorama scene. Used to restore the yaw angle when switching back when closing the yaw selection menu again.  
	 * @param {Function} callback The function to call once the yaw selection menu is closed. Returns a Boolean and if true, then it also returns the new yaw angle as a secondary parameter value.
	 */
	static open(panoramaID, yaw, callback) {
		if (typeof yaw === "string") {
			yaw = parseFloat(yaw);
		}

		state.tempData.targetYawCallback = callback;

		state.tempData.previousPanorama = state.currentPanorama;
		state.tempData.previousYaw   = state.currentPanorama.scene.view().yaw()-Main.degToRad(state.currentPanorama.data.orientation);
		state.tempData.previousPitch = state.currentPanorama.scene.view().pitch();

		state.htmlElements.editTargetYaw.classList.add("visible");
		ContextMenu.close();

		Panoramas.switchToPanorama(
			Panoramas.findPanoramaByID(panoramaID),
			{
				yaw: yaw,
				transitionDuration: 400
			}
		);

		state.tempData.disableInteraction = true;
	}

	/**
	 * Close the yaw selection menu. Switches back to the previous panorama scene from where the yaw selection menu was opened from. Also restores yaw and pitch.
	 * @method close
	 * @static
	 */
	static close() {

		state.tempData.disableInteraction = false;
		state.htmlElements.editTargetYaw.classList.remove("visible");
		
		Panoramas.switchToPanorama(
			state.tempData.previousPanorama,
			{
				yaw:   Main.radToDeg(state.tempData.previousYaw),
				pitch: Main.radToDeg(state.tempData.previousPitch),
				transitionDuration: 400
			}
		);
	}
}