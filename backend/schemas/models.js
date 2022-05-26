const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Hotspot = new Schema({
	type:		{ type: String, default: "", required: true },

	/* standard hotspot values */
	yaw:		{ type: Number, default: 0.0, required: true },
	pitch:		{ type: Number, default: 0.0, required: true },
	
	/* portal specific values */
	target:		{ type: String },
	rotation:	{ type: Number },
	preserveOrientationBetweenPanoramas: { type: Boolean, default: true },
	targetYaw:	{ type: Number },
	
	/* info hotspot specific values */
	title:		{ type: String },
	text:		{ type: String }
});

const Panorama = new Schema({
	name:		{ type: String, default: ""  	},
	lat:		{ type: Number, default: 0.0 	},
	lng:		{ type: Number, default: 0.0 	},
	orientation:{ type: Number, default: 0.0 	},
	isIndoors: 	{ type: Boolean, default: false	},
	floor:		{ type: Number, default: 0   	},
	building:	{ type: String, default: ""  	},
	room:		{ type: String, default: ""  	},
	yaw:		{ type: Number, default: 0.0, required: true },

	cubemapLevels: { type: [Schema.Types.Mixed], required: true, default: {} },
	
	hotspots:	{ type: [Hotspot], default: [] },
	poiRadius:	{ type: Number, default: 10, required: true },
	isStart:	{ type: Boolean	}
});

// Panorama.virtual('id').get(	function () { return this._id.toHexString() });
// Hotspot.virtual('id').get(	function () { return this._id.toHexString() });

// Panorama.set(	'toJSON', { virtuals: true });
// Hotspot.set(	'toJSON', { virtuals: true });

exports.Panorama = Panorama;
exports.Hotspot = Hotspot;