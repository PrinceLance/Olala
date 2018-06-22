const mongoose = require('mongoose');

const querySchema = mongoose.Schema({
	originPath : [[String, String]]
});

module.exports = mongoose.model('Query', querySchema);
