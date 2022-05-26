import BackendAPI 		from 'frontend/http/backend-api';

/**
 * Provides functions to import and export panorama data directly from/to the backend database.
 * @class Migration
 * @static
 */
export default class Migration {

    /**
     * Downloads a JSON file containg all panorama data from the backend database.
     * @method exportJSON
     * @static
     */
    static exportJSON() {
        
        BackendAPI.getAllPanoramaData(
            (panoramas) => {
				panoramas = panoramas.sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
				panoramas.forEach((panorama) => {
					delete panorama.__v; // not required
					delete panorama.id; // only leave _id intact
					if (!panorama.isStart) {
						delete panorama.isStart;
					}
					panorama.hotspots.forEach((hotspot) => {
						delete hotspot.id;
					})
				});

                const filename = 'data.json';
                const jsonStr = JSON.stringify({ panoramas: panoramas, }, undefined, 4);

				let file = new Blob([jsonStr], {type: 'text/plain'});
				if (window.navigator.msSaveOrOpenBlob) // IE10+
					window.navigator.msSaveOrOpenBlob(file, filename);
				else { // Others
					let a = document.createElement("a");
					let url = URL.createObjectURL(file);
					a.href = url;
					a.download = filename;
					document.body.appendChild(a);
					a.click();
					setTimeout(function() {
						document.body.removeChild(a);
						window.URL.revokeObjectURL(url);
					}, 0); 
				}
            },
            (error) => {
                console.error(error);
            }
        )
    }
}