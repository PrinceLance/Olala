const mongoose = require('mongoose');

const routeSchema = mongoose.Schema({
	status:  String,
	originPath: [[String, String]],
	path: [[String, String]],
	total_distance:   Number,
	total_time: Number,
	err_msg: String
});

module.exports = mongoose.model('Route', routeSchema);
