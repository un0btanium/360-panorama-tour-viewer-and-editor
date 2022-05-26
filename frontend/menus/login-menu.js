import BackendAPI		from 'frontend/http/backend-api';

import Editor 			from 'editor/editor';
import EditorSidebar 	from 'editor/menus/editor-sidebar';
import UploadMenu 		from 'editor/menus/upload-menu';

/**
 * This static class provides a menu for the user to login with his credentials. Currently used to unlock the editor as admin.
 * @class LoginMenu
 * @static
 */
export default class LoginMenu {

	/**
	 * Sets up event listeners to open and close the login menu via rightclicking the titlebar as well as submitting the login credentials and handling the response. On successful login, initializes the editor UI elements and functionality.
	 * @method setup
	 * @static
	 */
	static setup() {
		state.htmlElements.titleBar.addEventListener('contextmenu', (e) => {
			e.stopPropagation();
			e.preventDefault();

			LoginMenu.open();
		});

		document.getElementById('loginClose').addEventListener('click', (e) => {
			LoginMenu.close();
		});

		document.getElementById('loginSubmit').addEventListener('click', (e) => {
			document.querySelectorAll('.loginInput').forEach((element) => {
				if (element.classList.contains('success')) { element.classList.remove('success'); }
				if (element.classList.contains('error')) { element.classList.remove('error'); }
			});
			let submitButton = document.getElementById('loginSubmit');
			submitButton.disabled = true;
			submitButton.innerText = "Logging in...";

			BackendAPI.login(
				document.getElementById('loginUsername').value,
				document.getElementById('loginPassword').value,
				(data) => { // successful login
					document.querySelectorAll('.loginInput').forEach((element) => {
						if (!element.classList.contains('success')) { element.classList.add('success'); }
						if (element.classList.contains('error')) { element.classList.remove('error'); }
					});
					submitButton.innerText = "Sucessfully logged in! Editor enabled!";
					submitButton.classList.add('success');

					// setup and enable editor
					Editor.setup();
					state.settings.editorEnabled = true;

					setTimeout(() => {
						LoginMenu.close();
						submitButton.disabled = false;
						submitButton.classList.remove('success');
						LoginMenu.checkOpenEditorURLParameter();
						LoginMenu.checkIfNoPanoramasAvailable();
					}, 1000);
				},
				(error) => { // failed login
					document.querySelectorAll('.loginInput').forEach((element) => {
						if (!element.classList.contains('error')) { element.classList.add('error'); }
						if (element.classList.contains('success')) { element.classList.remove('success'); }
					});
					submitButton.innerText = "Login failed! Try again!";
					submitButton.classList.add('error');
					
					setTimeout(() => {
						submitButton.innerText = "Login";
						submitButton.disabled = false;
						submitButton.classList.remove('error');
					}, 1000);
					console.error(error);
				}
			)
		});
	}

	/**
	 * Checks if the user was already logged in from a previous session.
	 * @method checkIfAlreadyLoggedIn
	 * @static
	 */
	static checkIfAlreadyLoggedIn() {
		BackendAPI.isAdmin(
			() => { // token still valid
				// setup and enable editor
				Editor.setup();
				state.settings.editorEnabled = true;
				LoginMenu.checkOpenEditorURLParameter();
				LoginMenu.checkIfNoPanoramasAvailable();
			},
			(openLoginMenu) => { // token not valid (anymore)
				// open the Login Menu to show the user that he is not logged in anymore
				if (openLoginMenu || Object.keys(state.panoramasByID).length === 0) {
					LoginMenu.open();
				}
			}
		)
	}

	static checkOpenEditorURLParameter() {
		// parse url params
		var urlParams = {};
		window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
			urlParams[key] = value;
		});
		
		// opens the panorama editor if admin is still logged in from previous session and url had 'openEditor' parameter set to 'true'
		if (state.settings.editorEnabled) {
			if (urlParams['openEditor'] && urlParams['openEditor'] == "true") {
				EditorSidebar.openPanoramaEditorMenu();
			}
		}
	}

	static checkIfNoPanoramasAvailable() {
		if (Object.keys(state.panoramasByID).length === 0) {
			UploadMenu.open();
		}
	}

	/**
	 * Opens and closes the login menu.
	 * @method toggle
	 * @static
	 */
	static toggle() {
		if (state.htmlElements.loginMenu.classList.contains('enabled')) {
			LoginMenu.close();
		} else {
			LoginMenu.open();
		}
	}

	/**
	 * Opens the login menu.
	 * @method open
	 * @static
	 */
	static open() {
		if (!state.settings.editorEnabled && !state.htmlElements.loginMenu.classList.contains('enabled')) {
			state.htmlElements.loginMenu.classList.add('enabled');
		} else {
			LoginMenu.checkIfNoPanoramasAvailable();
		}
	}

	/**
	 * Closes the login menu.
	 * @method close
	 * @static
	 */
	static close() {
		if (state.htmlElements.loginMenu.classList.contains('enabled')) {
			state.htmlElements.loginMenu.classList.remove('enabled');
		}
	}
	
}