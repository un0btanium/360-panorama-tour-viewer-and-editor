const fs	= require('fs-extra');
const path	= require('path');

const ENV					= require('../constants');
const { Panorama }			= require('../utils/mongoose-utils');
const { generateLevels } 	= require('../utils/cubemap-generator-utils');

exports.getAllPanoramas = (req, res) => {
	Panorama.find({}, (err, panoramas) => {
		if (err) {
			console.error(err);
			// TODO send error response
			return;
		}
		res.send({ panoramas: panoramas });
	});
};


exports.createPanorama = (req, res) => {
	if (!req.files) {
		res.status(404).json({ error: 'Please provide panorama cubemap image files' });
		return;
	}

	// create new panorama document
	let panoramaDoc = new Panorama();
	
	generateLevels(
		panoramaDoc._id.toHexString(), // id as string
		req.files,
		parseInt(req.body.widthAndHeight),
		(cubemapLevels) => {
			panoramaDoc.cubemapLevels = cubemapLevels;
			panoramaDoc.name = req.body.originalImageFileName || "Unknown name",
			console.log(panoramaDoc)
			panoramaDoc.save((err, panorama) => {
				if (err) {
					console.error(err);
					// TODO send error response
					return;
				}
				console.log("New panorama added!");
				res.status(200).json({ panorama: panorama });
			});
		}
	)
	
};


exports.updatePanorama = (req, res) => {
	let data = req.body.panorama;

	// TODO send new equirectengular panorama image from frontend on creation and set unique file name (based on panorama document _id?)

	Panorama.findById(data._id, (err, panorama) => {
		if (err) {
			console.error(err);
			// TODO send error response
			return;
		}
		// remove data that isnt allowed to be changed via this post request
		delete data._id;
		delete data.id;
		delete data.hotspots;

		for (let key in data) {
			panorama[key] = data[key];
		}

		panorama.save((err, updatedPanorama) => {
			if (err) {
				console.error(err);
				// TODO send error response
				return;
			}
			res.send({ panorama: updatedPanorama });
		});
	});
};


exports.deletePanorama = (req, res) => {
	Panorama.deleteOne({ _id: req.body._id }, (err) => {
		if (err) {
			console.error(err);
			res.send( { deleted: false });
			return;
		}
		fs.remove(path.join(ENV.PANORAMA_DIRECTORY, req.body._id), (err) => {
			if (err) {
				console.error(err);
			}
			res.send( { deleted: true });
		});
	})
};
