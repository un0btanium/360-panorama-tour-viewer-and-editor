import screenfull from 'node_modules/screenfull';


/**
 * Adds functionality for all browsers to view the application in full screen mode.
 * @class Fullscreen
 * @static
 */
export default class Fullscreen {

	/**
	 * Initializes the functionality for going into full screen mode.
	 * @method setup
	 * @static
	 */
	static setup() {
		if (screenfull.isEnabled && state.settings.allowFullscreen) {
			document.body.classList.add('fullscreen-enabled');
			state.htmlElements.fullscreenToggle.addEventListener('click', function () {
				screenfull.toggle();
			});
			screenfull.on('change', function () {
				if (screenfull.isFullscreen) {
					state.htmlElements.fullscreenToggle.classList.add('enabled');
				} else {
					state.htmlElements.fullscreenToggle.classList.remove('enabled');
				}
			});
		} else {
			document.body.classList.add('fullscreen-disabled');
		}
	}
}
