import HotspotEditor	from 'editor/editors/hotspot-editor';

import ContextMenu		from 'editor/menus/context-menu';


/**
 * This class provides information on how to create a new hotspot and how to edit values of the portal hotspot type.
 * @class PortalEditor
 * @static
 */
export default class PortalEditor {

	/**
	 * Sets up anything specific for this hotspot type.
	 * @method setup
	 * @static
	 */
	static setup() {
		ContextMenu.addOption(
			"Add Portal",
			() => { HotspotEditor.create("portal"); }
		);
	}

	/**
	 * Returns the initial data for a new hotspot for this hotspot type.
	 * @method getInitialData
	 * @static
	 * @return {Object} The initial data for a new hotspot for this hotspot type.
	 */
	static getInitialData() {
		return {
			"type": "portal",
			"yaw": state.tempData.yaw,
			"pitch": state.tempData.pitch,
			"target": Object.values(state.panoramasByID)[0].data._id,
			"rotation": 0,
			"targetYaw": 0
		}
	}

	/**
	 * Returns a custom representation of the value types of this hotspot type. This is used to create fitting html input elements for the user to have the hotspot edited properly.
	 * @method getEditableValues
	 * @static
	 * @return {Object} The custom representation with the types for the attribute values.
	 */
	static getEditableValues() {
		return {
			"target":								{ type: "dropdownScenes"	, label: "Scene" },
			"rotation":								{ type: "range"				, label: "Rotation", },
			"preserveOrientationBetweenPanoramas": 	{ type: "checkbox"			, label: "Preserve Orientation"	},
			"targetYaw":							{ type: "buttonYawMenu"		, label: "TargetYaw", scene: "target" },
		};
	}
}