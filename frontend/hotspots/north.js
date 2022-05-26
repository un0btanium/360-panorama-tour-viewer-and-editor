
/**
 * The hotspot type to create and edit North hotspot with.
 * The North hotspot is used for the editor to help set the compass offset value for panoramas by indicating where north in the panorama is.
 * @class North
 * @static
 */
export default class North {

	/**
	 * Create a new hotspot of this hotspot type with the provided hotspot data.
	 * @method create
	 * @static
	 * @param {Object} hotspotData The hotspot data to create a new hotspot from.
	 * @return The new hotspot html element.
	 */
	static create(hotspotData) {
		// create wrapper element to hold icon and tooltip
		var wrapper = document.createElement('div');
		wrapper.classList.add('hotspot');
		wrapper.classList.add('north-icon');
		wrapper.innerText = "N";

		return wrapper;
	}

	/**
	 * Edit an existing hotspot of this hotspot type with the provided hotspot data.
	 * @method edit
	 * @static
	 * @param {Object} data The data with the changes to edit the hotspot with. Includes the id of the hotspot that is supposed to be edited.
	 */
	static edit(data) {
		// this type of hotspot does not get edited; function implementation still required to exist
	}
	
}