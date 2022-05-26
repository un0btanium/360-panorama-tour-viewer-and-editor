import EditorSidebar		from 'editor/menus/editor-sidebar';

import HotspotEditor		from 'editor/editors/hotspot-editor';
import PanoramaEditor		from 'editor/editors/panorama-editor';

import ContextMenu			from 'editor/menus/context-menu';
import YawSelectionMenu		from 'editor/menus/yaw-selection-menu';
import LocationPickerMenu	from 'editor/menus/location-picker-menu';
import UploadMenu			from 'editor/menus/upload-menu';

import PortalEditor			from 'editor/hotspots/portal-editor';
import TextInfoEditor		from 'editor/hotspots/text-info-editor';
import POIEditor			from 'editor/hotspots/poi-editor';

/**
 * This static class only initializes all editor functionalities.
 * @class Editor
 * @static
 */
export default class Editor {

	/**
	 * Sets up all the editor functionalities. Call only once on application startup after all the non-editor setups are finished.
	 * @method setup
	 * @static
	 */
	static setup() {
		// init editor specific state variables
		state.tempData.disableInteraction = false;
		state.currentEditorSidebar = { _id: undefined, menu: undefined };
		state.hotspotTypesEditor = {
			portal: PortalEditor,
			textInfo: TextInfoEditor,
			poi: POIEditor,
		}

		ContextMenu.setup(); // run first so that other class are able to add options to the menu
		YawSelectionMenu.setup();
		LocationPickerMenu.setup();
		UploadMenu.setup();

		EditorSidebar.setup();

		PanoramaEditor.setup();
		HotspotEditor.setup();
	}

}