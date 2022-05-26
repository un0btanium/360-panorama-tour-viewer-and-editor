const fs	= require('fs-extra');
const path	= require('path');

const sharp = require('sharp');

const ENV	= require('../constants');


const generateLevels = (panoramaId, files, size, callbackOnCompletion) => {
	let cubemapLevels = getCubeMapLevels(size);

	let folders = [];
	for (let file of files) {
		for (let lvl = 0; lvl < cubemapLevels.length; lvl++) {
			folders.push(path.join(ENV.PANORAMA_DIRECTORY, panoramaId, (""+lvl), file.originalname));
		}
	}
	createFolders(
		folders,
		() => {
			createTilesForLevels(
				panoramaId,
				files,
				cubemapLevels,
				callbackOnCompletion
			);
		}
	)
}

const createTilesForLevels = (panoramaId, files, cubemapLevels, callbackOnCompletion, lvl=0) => {
	if (lvl >= cubemapLevels.length) {
		callbackOnCompletion(cubemapLevels);
		return;
	}
	
	let folderPath = path.join(ENV.PANORAMA_DIRECTORY, panoramaId, ""+(lvl));
	let cubemapLevel = cubemapLevels[lvl];
	let totalTilesXY = cubemapLevel.size / cubemapLevel.tileSize;
	let totalTiles = totalTilesXY*totalTilesXY*files.length;

	console.log("Generating " + totalTiles + " cube tiles for 6 cubemap faces for level " + lvl);

	for (let file of files) {
		let facePath = path.join(folderPath, file.originalname);
		sharp(file.buffer)
			.clone()
			.resize(cubemapLevel.size, cubemapLevel.size)
			.toBuffer()
			.then((data) => {
				for (let x = 0; x <= totalTilesXY-1; x++) {
					for (let y = 0; y <= totalTilesXY-1; y++) {
						let tileName = path.join(facePath, "tile-" + x + "-" + y + ".jpg");
						sharp(data)
							.clone()
							.extract({ left: x*cubemapLevel.tileSize, top: y*cubemapLevel.tileSize, width: cubemapLevel.tileSize, height: cubemapLevel.tileSize })
							.toFile(tileName)
							.then((info) => {
								// console.log("Saved tile '" + lvl + "\\" + file.originalname + "\\tile-" + x + "-" + y + ".jpg" +"'");
								totalTiles--;
								if (totalTiles === 0) {
									console.log("Finished generating tiles for level " + lvl + "!");
									createTilesForLevels(panoramaId, files, cubemapLevels, callbackOnCompletion, lvl+1);
								}
							})
							.catch((err) => { console.error("Error on tile '" + tileName +"'", err) });
					}
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}

}

const getCubeMapLevels = (size) => {
	let levelSizes = getCubeMapLevelSizes(size).reverse();
	let cubemapLevels = []
	for (let i = 0; i < levelSizes.length; i++) {
		let tileSize = (i === 0) ? levelSizes[0] : levelSizes[1];
		cubemapLevels.push({ tileSize: tileSize, size: levelSizes[i] });
	}
	return cubemapLevels;
}

const getCubeMapLevelSizes = (size) => {
	let levelSizes = [];
	while (size >= 256) {
		levelSizes.push(size);
		size = size / 2;
	}
	return levelSizes;
}

const createFolders = (arrayOfFolderPaths, callback, index=0) => {
	if (index >= arrayOfFolderPaths.length) {
		callback();
	} else {
		fs.mkdir(
			arrayOfFolderPaths[index],
			{ recursive: true },
			(x) => {
				// console.log("Created folder '" + arrayOfFolderPaths[index] + "'!");
				createFolders(arrayOfFolderPaths, callback, index+1);
			}
		);
	}
}

module.exports = {
	generateLevels
};