import Bowser from 'node_modules/bowser'


/**
 * This static class detects if the website is running on a desktop- or mobile-sized resolution as well as touch is supported and Internet Explorer 11 needs fixes.
 * @class Detection
 * @static
 */
export default class Detection {
	
	/**
	 * This method can be called to call all the other methods in this class. 
	 * @method setup
	 * @static
	 */
	static setup() {
		Detection.detectDesktopOrMobile();
		Detection.detectTouchDevice();
		Detection.useTooltipFallbackForIE11();
	}

	/**
	 * Detect desktop or mobile mode.
	 * @method detectDesktopOrMobile
	 * @static
	 */
	static detectDesktopOrMobile() {
		if (window.matchMedia) {
			let setMode = function () {
				if (mql.matches) {
					document.body.classList.remove('desktop');
					document.body.classList.add('mobile');
				} else {
					document.body.classList.remove('mobile');
					document.body.classList.add('desktop');
				}
			};
			let mql = matchMedia("(max-width: 500px), (max-height: 500px)");
			setMode();
			mql.addListener(setMode);
		} else {
			document.body.classList.add('desktop');
		}
	}
	
	/**
	 * Detect whether we are on a touch device.
	 * @method detectTouchDevice
	 * @static
	 */
	static detectTouchDevice() {
		document.body.classList.add('no-touch');
		window.addEventListener('touchstart', function() {
			document.body.classList.remove('no-touch');
			document.body.classList.add('touch');
		});
	}
	
	/**
	 * Use tooltip fallback mode on IE < 11.
	 * @method useTooltipFallbackForIE11
	 * @static
	 */
	static useTooltipFallbackForIE11() {
		if (Bowser.msie && parseFloat(Bowser.version) < 11) {
			document.body.classList.add('tooltip-fallback');
		}
	}
}
