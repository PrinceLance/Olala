const mongoose = require('mongoose');

const pathSchema = mongoose.Schema({
	token:  String,
	status:  String,
	path : [[String, String]],
	total_distance:   Number,
	total_time: Number,
	err_msg: String
});

module.exports = mongoose.model('Path', pathSchema);
