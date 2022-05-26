import Marzipano	from 'marzipano';


/**
 * This static class provides the feature of automatically rotating the view direction within a panorama.
 * @class Autorotation
 * @static
 */
export default class Autorotation {
	
	/**
	 * Initializes the functionality for the panorama autorotation.
	 * @method setup
	 * @static
	 */
	static setup() {
		state.autorotate = Marzipano.autorotate({
			yawSpeed: 0.03,
			targetPitch: 0.05,
			targetFov: Math.PI / 2
		});
	
		if (state.settings.autorotateEnabled) {
			state.htmlElements.autorotateToggle.classList.add('enabled');
		}
		
		// set handler for autorotate toggle
		state.htmlElements.autorotateToggle.addEventListener('click', Autorotation.toggle);
	}
	
	/**
	 * Starts to automatically rotate and look around in the panorama. It only starts it when the rotation was toggled on and then stopped. Therefore this is only useful in combination with the .stop() method.
	 * Use the .toggle() method instead for start/stop the auto rotation properly.
	 * @method start
	 * @static
	 */
	static start() {
		if (!state.htmlElements.autorotateToggle.classList.contains('enabled')) {
			return;
		}
		state.viewer.startMovement(state.autorotate);
		state.viewer.setIdleMovement(3000, state.autorotate);
	}
	
	/**
	 * Stops the automatic rotation of the panorama.
	 * After using this method you need to start the rotation again with the .start() method. Therefore this method is only useful in combination with the .start() method.
	 * Use the .toggle() method instead for start/stop the auto rotation properly.
	 * @method stop
	 * @static
	 */
	static stop() {
		state.viewer.stopMovement();
		state.viewer.setIdleMovement(Infinity);
	}
	
	/**
	 * Toggles the automatic rotation of the panorama. This method should be used over the start/stop methods, because those are only useful for internal edge-cases.
	 * @method toggle
	 * @static
	 */
	static toggle() {
		if (state.htmlElements.autorotateToggle.classList.contains('enabled')) {
			state.htmlElements.autorotateToggle.classList.remove('enabled');
			Autorotation.stop();
		} else {
			state.htmlElements.autorotateToggle.classList.add('enabled'); // important: needs to be added before calling .start()
			Autorotation.start();
		}
	}
}