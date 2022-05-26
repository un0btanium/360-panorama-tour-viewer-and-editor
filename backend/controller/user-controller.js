const ENV = require('../constants');
const jwt = require('jsonwebtoken');

// login as admin to enable editor functionality in the browser
exports.login = (req, res) => {
	if (req.body && req.body.username && req.body.password && req.body.username === ENV.ADMIN_USERNAME && req.body.password === ENV.ADMIN_PASSWORD) {
		const token = jwt.sign(
			{
				name: req.body.username,
				role: "admin"
			},
			ENV.JWT_KEY,
			{
				expiresIn: "6h"
			}
		);
		return res.status(200).send({ token: token });
	} else {
		res.status(401).json({});
	}
}

exports.isAdmin = (req, res) => {
	return res.status(200).send();
}