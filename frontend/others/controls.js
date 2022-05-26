import Marzipano	from 'marzipano';


/**
 * Adds functionality to the UI buttons at the bottom of the page to control the panorama with as an alternative to the mouse drag and click controls on the panorama itself.
 * @class Controls
 * @static
 */
export default class Controls {
	
	/**
	 * Initializes the functionality for the UI buttons at the bottom of the page to control the panorama with. 
	 * @method setup
	 * @static
	 */
	static setup() {
		var controls = state.viewer.controls();
		let {velocity, friction} = state.settings;

		// UI Buttons
		controls.registerMethod('upElement', new Marzipano.ElementPressControlMethod(state.htmlElements.viewUp, 'y', -velocity/2, friction), true);
		controls.registerMethod('downElement', new Marzipano.ElementPressControlMethod(state.htmlElements.viewDown, 'y', velocity/2, friction), true);
		controls.registerMethod('leftElement', new Marzipano.ElementPressControlMethod(state.htmlElements.viewLeft, 'x', -velocity, friction), true);
		controls.registerMethod('rightElement', new Marzipano.ElementPressControlMethod(state.htmlElements.viewRight, 'x', velocity, friction), true);
		controls.registerMethod('inElement', new Marzipano.ElementPressControlMethod(state.htmlElements.viewIn, 'zoom', -velocity, friction), true);
		controls.registerMethod('outElement', new Marzipano.ElementPressControlMethod(state.htmlElements.viewOut, 'zoom', velocity, friction), true);
	
		// Keyboard Buttons
		controls.registerMethod('upArrowKey2', new Marzipano.KeyControlMethod(38, 'y', -velocity, friction*2), true);
		controls.registerMethod('downArrowKey2', new Marzipano.KeyControlMethod(40, 'y', velocity, friction*2), true);
		controls.registerMethod('leftArrowKey2', new Marzipano.KeyControlMethod(37, 'x', -velocity, friction*2), true);	
		controls.registerMethod('rightArrowKey2', new Marzipano.KeyControlMethod(39, 'x', velocity, friction*2), true);
		controls.registerMethod('upKey', new Marzipano.KeyControlMethod(87, 'y', -velocity, friction*2), true);
		controls.registerMethod('downKey', new Marzipano.KeyControlMethod(83, 'y', velocity, friction*2), true);
		controls.registerMethod('leftKey', new Marzipano.KeyControlMethod(65, 'x', -velocity, friction*2), true);
		controls.registerMethod('rightKey', new Marzipano.KeyControlMethod(68, 'x', velocity, friction*2), true);
		controls.registerMethod('inKey', new Marzipano.KeyControlMethod(187, 'zoom', -velocity, friction), true);
		controls.registerMethod('outKey', new Marzipano.KeyControlMethod(189, 'zoom', velocity, friction), true);
		controls.registerMethod('inNumKey', new Marzipano.KeyControlMethod(107, 'zoom', -velocity, friction), true);
		controls.registerMethod('outNumKey', new Marzipano.KeyControlMethod(109, 'zoom', velocity, friction), true);
	}

	/**
	 * Prevents event propagation on the provided html element
	 * @method stopTouchAndScrollEventPropagation
	 * @static
	 * @param {HTMLElement} htmlElement The html element to prevent event propagation on.
	 */
	static stopTouchAndScrollEventPropagation(htmlElement) {
		var eventList = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel', 'mousewheel'];
		for (var i = 0; i < eventList.length; i++) {
			htmlElement.addEventListener(eventList[i], function (event) {
				event.stopPropagation();
			}, { passive: true });
		}
	}

}