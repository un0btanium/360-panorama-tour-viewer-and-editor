const PanoramaController = require('../controller/panorama-controller');

const checkAuth = require('../middleware/authentication');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const express = require('express');
const router = express.Router();


router.post(	'/'	, (req, res, next) => checkAuth(req, res, next, ["admin"])	, upload.array('cubemaptiles', 6),	PanoramaController.createPanorama); // adds new panorama image
router.put(		'/'	, (req, res, next) => checkAuth(req, res, next, ["admin"])	,									PanoramaController.updatePanorama); // update an existing panorama image
router.delete(	'/'	, (req, res, next) => checkAuth(req, res, next, ["admin"])	,									PanoramaController.deletePanorama); // delete a panorama image


module.exports = router;