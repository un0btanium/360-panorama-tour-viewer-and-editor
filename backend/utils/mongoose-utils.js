require('nedb-mongoose-driver').install();

const ENV = require('../constants');
const mongoose = require('mongoose');
const fs = require('fs');

mongoose.Promise = Promise;

const models = require('../schemas/models.js');
const Panorama = mongoose.model('Panorama', models.Panorama);


mongoose.set('debug', true);
fs.mkdirSync(ENV.DB_PATH, { recursive: true });

const dbPath = ENV.DB_PATH;
console.log({dbPath})

mongoose.connect('mongodb://localhost/indoor360', {
	dbPath,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
 });
mongoose.connection.once('open', async () => {
	console.log('connected', dbPath);
});
mongoose.connection.on('error', (err) => {
	console.log('error', err);
});

// Use this if Cross-Origin Resource Sharing is required
// const cors = require('cors');
// app.use(cors());
// const mongourl = process.env.NODE_DB || 'mongodb://127.0.0.1:27017/indoor360';
// console.log(`selected mongodb: ${mongourl}`);
// mongoose.connect(mongourl, {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// 	useFindAndModify: false
// });



// DEVELOPMENT: this fills the database with example data if none is available
const populateEmptyDatabase = () => {
	Panorama.find({}, (err, panoramas) => {
		if (err) {
			console.error(err);
			return;
		}
		if (panoramas.length === 0) {
			let data = JSON.parse(JSON.stringify(require('../data.json')));
			data.panoramas.forEach((panorama) => {
				let panoramaDocument = new Panorama(panorama);
				panoramaDocument.save((err, doc) => {
					if (err) {
						console.error(e);
						return;
					}
					console.log("Panorama Document saved!");
				});
			});
		}
	});
};

// DEVELOPMENT: this drops the database! Use with care! Create database backup prior!
const dropDatabase = () => {
	Panorama.remove({}, function(err) {
		if (err) {
			console.error(error);
			return;
		}
		console.log('Dropped database!');
	});
}

module.exports = {
	Panorama,
	dropDatabase,
	populateEmptyDatabase
}