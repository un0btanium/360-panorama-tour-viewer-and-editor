import PanoramaEditor from "editor/editors/panorama-editor";

/**
 * This menu allows the user to upload panorama images and create a new panorama secne from it.
 * Converts equirectangular panorama images to cubetiles before uploading them.
 * @class UploadMenu
 * @static
 */
export default class UploadMenu {

	/**
	 * Initializes the panorama image upload menu.
	 * @method setup
	 * @static
	 */
	static setup() {
		document.body.appendChild(
			<div class="upload-menu animateZoom" id="upload-menu">
				<div class="row">
					<div class="column">
						<div class="upload-menu-header-text">Upload panorama image! Select format, then file(s):</div>
					
						<div class="tab">
							<button class="tablinks" id="tablink-equirectangular">Equirectangular</button>
							<button class="tablinks" id="tablink-cubemap">CubeMap</button>
						</div>

						<div id="tab-equirectangular" class="tabcontent">
							<div class="row">
								<label class="input-button hidden"></label>
							</div>
							<div class="row">
								<label class="input-button hidden"></label>
								<label class="input-button hidden"></label>
								<label class="input-button equirectangular">Select Image <input id="imageFileInput" type="file" accept="image/*" /></label>
							</div>
						</div>
						<div id="tab-cubemap" class="tabcontent">
							<div class="row">
								<label class="input-button hidden"></label>
								<label class="input-button hidden"></label>
								<label class="input-button">Top <input id="imageFileInputUp" type="file" accept="image/*" /></label>
							</div>
							<div class="row">
								<label class="input-button hidden"></label>
								<label class="input-button">Left <input id="imageFileInputLeft" type="file" accept="image/*" /></label>
								<label class="input-button">Front <input id="imageFileInputFront" type="file" accept="image/*" /></label>
								<label class="input-button">Right <input id="imageFileInputRight" type="file" accept="image/*" /></label>
								<label class="input-button">Back <input id="imageFileInputBack" type="file" accept="image/*" /></label>
							</div>
							<div class="row">
								<label class="input-button hidden"></label>
								<label class="input-button hidden"></label>
								<label class="input-button">Bottom <input id="imageFileInputDown" type="file" accept="image/*" /></label>
							</div>
						</div>
						
						<div class="upload-menu-text">Equirectangular image will be converted into six cubemap faces.</div>
						<div class="upload-menu-text">On successful convertion the cubemap will be uploaded.</div>
						<div class="upload-menu-text">A new panorama will be created and switched to!</div>
					</div>
					
					<div class="column">
						<div class="upload-menu-header-text">Preview</div>

						<div class="cubemap-container">
							<div class="loading-circle upload-menu-loading-circle" id="upload-menu-loading-circle"></div>
							<output id="cubeMapFaces"></output>
						</div>
					</div>
				</div>
				
				<div class="editor-item-list-container">
					<div class="editor-item-element-row">
						<div class="editor-item-element-medium">
							<button id="upload-menu-cancel-button" class="cancel-button">Cancel</button>
						</div>
					</div>
				</div>
			
			</div>
		);

		state.htmlElements.uploadMenu = document.getElementById('upload-menu');
		state.htmlElements.uploadMenuCanvas = document.createElement('canvas');
		state.htmlElements.uploadMenuCubeMapFaces = document.getElementById('cubeMapFaces');
		state.htmlElements.uploadMenuLoadingCircle = document.getElementById('upload-menu-loading-circle');
		
		state.htmlElements.uploadMenuFileInput = document.getElementById('imageFileInput');
		
		state.htmlElements.uploadMenuFileInputCubeMap = {
			up:	document.getElementById('imageFileInputUp'),
			down:	document.getElementById('imageFileInputDown'),
			front:	document.getElementById('imageFileInputFront'),
			back:	document.getElementById('imageFileInputBack'),
			right:	document.getElementById('imageFileInputRight'),
			left:	document.getElementById('imageFileInputLeft')
		}
		
		document.getElementById('tablink-equirectangular').addEventListener('click', (e) => { UploadMenu.openTab(e, 'tab-equirectangular') })
		document.getElementById('tablink-cubemap').addEventListener(		'click', (e) => { UploadMenu.openTab(e, 'tab-cubemap') })
		
		document.getElementById('upload-menu-cancel-button').addEventListener('click', () => {
			UploadMenu.close();
		})

		state.uploadMenu = {
			workers: [],
			finishedWorkers: 0,
			images: {}
		}

		state.htmlElements.uploadMenuFileInput.addEventListener('change', UploadMenu.loadEquirectangularImage);

		state.htmlElements.uploadMenuFileInputCubeMap.up.addEventListener('change', UploadMenu.loadCubeMapImage);
		state.htmlElements.uploadMenuFileInputCubeMap.down.addEventListener('change', UploadMenu.loadCubeMapImage);
		state.htmlElements.uploadMenuFileInputCubeMap.front.addEventListener('change', UploadMenu.loadCubeMapImage);
		state.htmlElements.uploadMenuFileInputCubeMap.back.addEventListener('change', UploadMenu.loadCubeMapImage);
		state.htmlElements.uploadMenuFileInputCubeMap.left.addEventListener('change', UploadMenu.loadCubeMapImage);
		state.htmlElements.uploadMenuFileInputCubeMap.right.addEventListener('change', UploadMenu.loadCubeMapImage);

		UploadMenu.openTab({ currentTarget: document.getElementById('tablink-equirectangular') }, 'tab-equirectangular');
	}

	/**
	 * Loads the equirectangular image from the html file input element and starts converting it into cubemap tile faces.  
	 * @method loadEquirectangularImage
	 * @static 
	 */
	static loadEquirectangularImage() {
		const file = state.htmlElements.uploadMenuFileInput.files[0];
		if (!file) {
			return;
		}
		state.htmlElements.uploadMenuFileInput.disabled = true;

		const img = new Image();
		img.src = URL.createObjectURL(file);

		img.addEventListener('load', () => {
			const { width, height } = img;
			state.htmlElements.uploadMenuCanvas.width = width;
			state.htmlElements.uploadMenuCanvas.height = height;
			state.htmlElements.uploadMenuCanvas.getContext('2d').drawImage(img, 0, 0);

			const data = state.htmlElements.uploadMenuCanvas.getContext('2d').getImageData(0, 0, width, height);
			UploadMenu.processImage(data);
		});
	}
	
	/**
	 * Loads the cubemap image faces from the html file input elements and sends them to the backend.  
	 * @method loadCubeMapImage
	 * @static 
	 */
	static loadCubeMapImage() {
		for (let worker of state.uploadMenu.workers) {
			worker.terminate();
		}
		state.uploadMenu = {
			workers: [],
			finishedWorkers: 0,
			images: {}
		}
		while (state.htmlElements.uploadMenuCubeMapFaces.firstChild) {
			state.htmlElements.uploadMenuCubeMapFaces.removeChild(state.htmlElements.uploadMenuCubeMapFaces.firstChild);
		}

		const files = [
			{ side: 'up', image: state.htmlElements.uploadMenuFileInputCubeMap.up.files[0] },
			{ side: 'down', image: state.htmlElements.uploadMenuFileInputCubeMap.down.files[0] },
			{ side: 'front', image: state.htmlElements.uploadMenuFileInputCubeMap.front.files[0] },
			{ side: 'back', image: state.htmlElements.uploadMenuFileInputCubeMap.back.files[0] },
			{ side: 'right', image: state.htmlElements.uploadMenuFileInputCubeMap.right.files[0] },
			{ side: 'left', image: state.htmlElements.uploadMenuFileInputCubeMap.left.files[0] }
		];
		const facePositions = {
			back: 	{ x: 3, y: 1 },
			front: 	{ x: 1, y: 1 },
			left: 	{ x: 0, y: 1 },
			right: 	{ x: 2, y: 1 },
			up: 	{ x: 1, y: 0 },
			down: 	{ x: 1, y: 2 }
		};

		let uploadCubeMapFaces = (width) => {
			if (!state.htmlElements.uploadMenuLoadingCircle.classList.contains('visible')) {
				state.htmlElements.uploadMenuLoadingCircle.classList.add('visible');
			}
	
			state.htmlElements.uploadMenuFileInputCubeMap.up.disabled = true;
			state.htmlElements.uploadMenuFileInputCubeMap.down.disabled = true;
			state.htmlElements.uploadMenuFileInputCubeMap.front.disabled = true;
			state.htmlElements.uploadMenuFileInputCubeMap.back.disabled = true;
			state.htmlElements.uploadMenuFileInputCubeMap.right.disabled = true;
			state.htmlElements.uploadMenuFileInputCubeMap.left.disabled = true;

			PanoramaEditor.create(
				state.uploadMenu.images,
				width,
				"New CubeMap Panorama"
			);

			state.uploadMenu.finishedWorkers = 0;
			state.uploadMenu.workers = [];
			state.uploadMenu.images = {};
		}

		let setPreview = (files, index=0) => {
			if (files[index].image) {
				const face = new CubeFace(files[index].side);
				state.htmlElements.uploadMenuCubeMapFaces.appendChild(face.anchor);
	
				const img = new Image();
				img.src = URL.createObjectURL(files[index].image);

				img.addEventListener('load', () => {
					const { width, height } = img;
					state.htmlElements.uploadMenuCanvas.width = width;
					state.htmlElements.uploadMenuCanvas.height = height;
					state.htmlElements.uploadMenuCanvas.getContext('2d').drawImage(img, 0, 0);

					const imageData = state.htmlElements.uploadMenuCanvas.getContext('2d').getImageData(0, 0, width, height);
					const x = 100 * facePositions[files[index].side].x;
					const y = 100 * facePositions[files[index].side].y;
					
					UploadMenu.getDataURL(imageData)
						.then(url => {
							face.setPreview(url, x, y);
							face.onFinishedInterpolation(url);
						});
							
					UploadMenu.getBlob(imageData)
						.then(blob => {
							state.uploadMenu.images[files[index].side] = blob;
							
							state.uploadMenu.finishedWorkers++;
							if (state.uploadMenu.finishedWorkers === 6) {
								uploadCubeMapFaces(imageData.width);
							} else if (index+1 < files.length) {
								setPreview(files, index+1);
							}
						});
				});
			} else if (index+1 < files.length) {
				setPreview(files, index+1);
			}
		};

		setPreview(files);
	}

	/**
	 * Converts the image data into cubemap tile faces.
	 * @method processImage
	 * @static
	 * @param {Object} data The canvas image data. 
	 */
	static processImage(data) {
		while (state.htmlElements.uploadMenuCubeMapFaces.firstChild) {
			state.htmlElements.uploadMenuCubeMapFaces.removeChild(state.htmlElements.uploadMenuCubeMapFaces.firstChild);
		}

		if (!state.htmlElements.uploadMenuLoadingCircle.classList.contains('visible')) {
			state.htmlElements.uploadMenuLoadingCircle.classList.add('visible');
		}

		for (let worker of state.uploadMenu.workers) {
			worker.terminate();
		}
		state.uploadMenu = {
			workers: [],
			finishedWorkers: 0,
			images: {}
		}

		const facePositions = {
			back: 	{ x: 3, y: 1 },
			front: 	{ x: 1, y: 1 },
			left: 	{ x: 0, y: 1 },
			right: 	{ x: 2, y: 1 },
			up: 	{ x: 1, y: 0 },
			down: 	{ x: 1, y: 2 }
		};
		for (let [faceName, position] of Object.entries(facePositions)) {
			UploadMenu.renderFace(data, faceName, position);
		}
	}

	/**
	 * Creates one cubemap tile face from the image data.
	 * @method renderFace
	 * @static
	 * @param {Object} data The canvas image data. 
	 * @param {String} faceName The name of the face.
	 * @param {Object} position The x and y positions within the cubemap.
	 */
	static renderFace(data, faceName, position) {
		const face = new CubeFace(faceName);
		state.htmlElements.uploadMenuCubeMapFaces.appendChild(face.anchor);

		const options = {
			data: data,
			face: faceName,
			rotation: Math.PI * 0 / 180,
			interpolation: 'lanczos',
		};

		const worker = new Worker('equirectangular-to-cubemap-converter.js');

		const onFinishedInterpolation = ({ data: imageData }) => {
			UploadMenu.getDataURL(imageData)
				.then(url => {
					face.onFinishedInterpolation(url);
				});
			
			UploadMenu.getBlob(imageData)
				.then(blob => {
					state.uploadMenu.images[faceName] = blob;

					state.uploadMenu.finishedWorkers++;
					if (state.uploadMenu.finishedWorkers === 6) {
						PanoramaEditor.create(
							state.uploadMenu.images,
							imageData.width,
							state.htmlElements.uploadMenuFileInput.value.replace(/.*[\/\\]/, '')
						);

						state.uploadMenu.finishedWorkers = 0;
						state.uploadMenu.workers = [];
						state.uploadMenu.images = {};
					}
				});
		};

		const setPreview = ({ data: imageData }) => {
			const x = 100 * position.x;
			const y = 100 * position.y;

			UploadMenu.getDataURL(imageData)
				.then(url => face.setPreview(url, x, y));

			worker.onmessage = onFinishedInterpolation;
			worker.postMessage(options);
		};

		worker.onmessage = setPreview;
		worker.postMessage(
			Object.assign(
				{},
				options,
				{
					// maxWidth: 100,
					interpolation: 'linear',
				}
			)
		);

		state.uploadMenu.workers.push(worker);
	}

	/**
	 * Exports the image data as an data url to acecss the image file from.
	 * @method getDataURL
	 * @static
	 * @param {Object} imgData The canvas image data.
	 * @return {String} The data url of the image file.
	 */
	static getDataURL(imgData) {
		state.htmlElements.uploadMenuCanvas.width = imgData.width;
		state.htmlElements.uploadMenuCanvas.height = imgData.height;

		state.htmlElements.uploadMenuCanvas.getContext('2d').putImageData(imgData, 0, 0);

		return new Promise(resolve => {
			state.htmlElements.uploadMenuCanvas.toBlob(
				blob => resolve(URL.createObjectURL(blob)),
				'image/jpeg',
				0.92
			);
		});
	}

	/**
	 * Creates a blob of the image data.
	 * @method getBlob
	 * @static
	 * @param {Object} imgData The canvas image data. 
	 * @return {Blob} Returns a blob object containing the data about the image.
	 */
	static getBlob(imgData) {
		state.htmlElements.uploadMenuCanvas.width = imgData.width;
		state.htmlElements.uploadMenuCanvas.height = imgData.height;

		state.htmlElements.uploadMenuCanvas.getContext('2d').putImageData(imgData, 0, 0);

		return new Promise(resolve => {
			state.htmlElements.uploadMenuCanvas.toBlob(
				blob => resolve(blob),
				'image/jpeg',
				0.92
			);
		});
	}

	/**
	 * 
	 * @method openTab
	 * @static
	 * @param {Event} e 
	 * @param {String} tabID 
	 */
	static openTab(e, tabID) {
		let tabcontent = document.getElementsByClassName("tabcontent");
		for (let i = 0; i < tabcontent.length; i++) {
		  tabcontent[i].style.display = "none";
		}
	  
		let tablinks = document.getElementsByClassName("tablinks");
		for (let i = 0; i < tablinks.length; i++) {
		  tablinks[i].classList.remove("active");
		}
		
		document.getElementById(tabID).style.display = "block";
		e.currentTarget.classList.add("active");
	}


	/**
	 * Opens/Closes the context menu.
	 * @method toggle
	 * @static
	 */
	static toggle() {
		if (state.htmlElements.uploadMenu.classList.contains("visible")) {
			UploadMenu.close();
		} else {
			UploadMenu.open();
		}
	}

	/**
	 * Opens the context menu.
	 * @method open
	 * @static
	 */
	static open() {
		if (!state.htmlElements.uploadMenu.classList.contains("visible")) {
			state.htmlElements.uploadMenu.classList.add("visible");
		}
	}

	/**
	 * Closes the context menu.
	 * @method close
	 * @static
	 */
	static close() {
		if (state.htmlElements.uploadMenu.classList.contains("visible")) {
			state.htmlElements.uploadMenu.classList.remove("visible");
		}
	}
}

class CubeFace {
	constructor(faceName) {
		this.faceName = faceName;

		this.anchor = document.createElement('a');
		this.anchor.style.position = 'absolute';
		this.anchor.title = faceName;

		this.img = document.createElement('img');
		this.img.style.filter = 'blur(4px)';
		this.img.style.width = '100px';

		this.anchor.appendChild(this.img);
	}

	setPreview(url, x, y) {
		this.img.src = url;
		this.anchor.style.left = `${x}px`;
		this.anchor.style.top = `${y}px`;
	}

	onFinishedInterpolation(url, fileExtension="jpg") {
		// this.anchor.href = url;
		// this.anchor.download = `${this.faceName}.${fileExtension}`;
		this.img.style.filter = '';
	}
}