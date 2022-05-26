
/**
 * This class provides information on how to create a new hotspot and how to edit values of the POI hotspot type.
 * @class POIEditor
 * @static
 */
export default class POIEditor {
	
	/**
	 * Sets up anything specific for this hotspot type. 
	 * @method setup
	 * @static
	 */
	static setup() {
		
	}

	/**
	 * Returns the initial data for a new hotspot for this hotspot type.
	 * @method getInitialData
	 * @static
	 * @return {Object} The initial data for a new hotspot for this hotspot type.
	 */
	static getInitialData() {
		return {
			"type": "poi",
			"yaw": state.tempData.yaw,
			"pitch": state.tempData.pitch
		}
	}

	/**
	 * Returns a custom representation of the value types of this hotspot type. This is used to create fitting html input elements for the user to have the hotspot edited properly.
	 * @method getEditableValues
	 * @static
	 * @return {Object} The custom representation with the types for the attribute values.
	 */
	static getEditableValues() {
		return {};
	}

}