const HotspotController = require('../controller/hotspot-controller');

const checkAuth = require('../middleware/authentication');

const express = require('express');
const router = express.Router();


router.post(	'/'	, (req, res, next) => checkAuth(req, res, next, ["admin"])	, HotspotController.createHotspot); // add new hotspot to a panorama
router.put(		'/'	, (req, res, next) => checkAuth(req, res, next, ["admin"])	, HotspotController.updateHotspot); // update an existing hotspot of an existing panorama
router.delete(	'/'	, (req, res, next) => checkAuth(req, res, next, ["admin"])	, HotspotController.deleteHotspot); // deletes a hotspot


module.exports = router;