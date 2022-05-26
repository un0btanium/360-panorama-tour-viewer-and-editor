
export default class AngleCalculator {

	static calculateAngle(panoramaData, poiData) {
		const subtractVector	= (v1, v2)	=> { return { lng: v1.lng-v2.lng, lat: v1.lat-v2.lat}; };
		const normalizeVector	= (v)		=> { let l = vectorLength(v); return { lng: v.lng/l, lat: v.lat/l }; };
		const vectorLength		= (v)		=> Math.sqrt(v.lng*v.lng + v.lat*v.lat);
		const dotProduct		= (a, b)	=> a.lng*b.lng+a.lat*b.lat;

		let vPano  = { lng: panoramaData.lng,	lat: panoramaData.lat };
		// let vNorth = { lng: vPano.lng,			lat: vPano.lat+0.02	  };
		let vPoi   = { lng: poiData.longitude,	lat: poiData.latitude };

		let v1 = { lng: 0, lat: 1 } // normalizeVector(subtractVector(vNorth, vPano));
		let v2 = normalizeVector(subtractVector(vPoi, vPano));

		let angle = Math.acos(dotProduct(v1, v2)) / Math.PI * 180;

		if (poiData.longitude < panoramaData.lng) {
			angle = -angle;
		}

		return angle;
	}

	static calculateAngleOldFormula (panoramaData, poiData) {
		const toVector 		= (lat, lng)	=> { return { x: Math.cos(lng) * Math.sin(lat), y: Math.sin(lng) * Math.sin(lat), z: Math.cos(lat) }; }
		const vectorLength	= (v)			=> Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
		const dotProduct	= (a, b)		=> a.x*b.x + a.y*b.y;
		const crossProduct 	= (a, b)		=> { return { x: a.y*b.z - a.z*b.y, y: a.z*b.x - a.x*b.z, z: a.x*b.y - a.y*b.x }; };

		let vNorth = toVector(panoramaData.lat+0.02, panoramaData.lng);
		let vPano  = toVector(panoramaData.lat, panoramaData.lng);
		let vPoi   = toVector(poiData.latitude, poiData.longitude);

		let n1 = crossProduct(vPano, vPoi);
		let n2 = crossProduct(vNorth, vPano);

		let top = dotProduct(n1, n2);
		let bottom = vectorLength(n1) * vectorLength(n2);

		let angle = (Math.acos(top/bottom)/(Math.PI/180))-180;
		
		if (poiData.longitude > panoramaData.lng) {
			angle = -angle;
		}

		return angle
	}
}