const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');// Configuring the database
const mongoose = require('mongoose');
const request = require('request');

if(process.env.NODE_ENV == 'test')
	var dbConfig = require('./app/configs/database-test.js');	
else
	var dbConfig = require('./app/configs/database.js');	

//swaggerDoc.host="localhost:" + process.env.PORT

// to allow cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// for documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())


console.log(dbConfig.url);
mongoose.Promise = global.Promise;
// Connecting to the database
mongoose.connect(dbConfig.url)
.then(() => {
    if(process.env.NODE_ENV != 'test')
    	console.log("Successfully connected to the database");    
}).catch(err => {
    if(process.env.NODE_ENV != 'test')
    	console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

// define a simple route, for quick testing
app.get('/', (req, res) => {
    res.json({"message": "Welcome to Olala. Good job on successfully running my shitty code"});
});

// the routes
require('./app/routes/routes.js')(app);

// listen for requests
app.listen(3000, () => {
    if(process.env.NODE_ENV != 'test')
    	console.log("Server is listening on port 3000");
});

module.exports = app; // for testing