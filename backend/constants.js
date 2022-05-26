const path = require('path');

const EXPRESS_PORT		= 3000;
const JWT_KEY			= "AWDWN124WAKNUF432WNKFANUWKFANK679ANUFAWBFADFB4572352AUKFD";
const ADMIN_USERNAME	= "admin";
const ADMIN_PASSWORD	= "admin";

const PANORAMA_DIRECTORY = path.join(__dirname, 'public', 'panoramas');
const CMD_BUILDING_OUTLINES_DIRECTORY = path.join(__dirname, 'public', 'cmd-building-info');

const FAVICON_PATH = path.join(__dirname, 'public', 'favicon.ico');
const STATIC_FILES = path.join(__dirname, 'public');

const DB_PATH = path.join(__dirname, 'db', 'nedb');

module.exports = Object.freeze({
	EXPRESS_PORT,
	JWT_KEY,
	ADMIN_USERNAME,
	ADMIN_PASSWORD,
	PANORAMA_DIRECTORY,
	CMD_BUILDING_OUTLINES_DIRECTORY,
	FAVICON_PATH,
	STATIC_FILES,
	DB_PATH
});