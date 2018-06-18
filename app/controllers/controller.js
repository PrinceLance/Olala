const Route = require('../models/model.js');

// Submit start point and waypoints
exports.submitRoute = (req, res) => {

	// Validate request
	if(!req.body) {
		return res.status(400).send({
			message: "The waypoints are empty! You are trolling, aren't you?"
		});
	}

	if(req.body.length < 2){
		return res.status(400).send({
			message: "The waypoints are less than 2, You are trolling, aren't you?"
		});
	}

	// Create a Route
	const newRoute = new Route({
		"status": "in progress",
		"originPath" : req.body,
		"path": [],
		"total_distance": 0,
		"total_time": 0,
		"err_msg": "in progress"
	});	
	
	// save the in progess
	newRoute.save()
	.then(function(data){
		var respObj = {};
		respObj.token = data._id;
		res.send(respObj);
		
		this._id = data._id;
		var waypoints = data.originPath;

		// params to pass to google directions api
		var googleAPIParams = {
			mode:"driving",
			origin:waypoints[0],
			destination:waypoints[waypoints.length-1],
			waypoints:[] 
		};

		for (var i=1; i<waypoints.length-1; i++){
			googleAPIParams.waypoints.push(waypoints[i]);
		}		

		// init gmap client
		googleMapsClient = require('@google/maps').createClient({
			key: require('../../app/configs/googleAPIkey.js').key,   // HEYYY dont copy, gonna disable this soon
			Promise: Promise
		});		
		
		// call gmap API
		googleMapsClient.directions(googleAPIParams)
		.asPromise()
		.then((response) => {

			if(response.json.status == "OK")
			{
				var path = [];
				var distance = 0;
				var duration = 0;

				// starting point
				path.push([response.json.routes[0].legs[0].start_location.lat , response.json.routes[0].legs[0].start_location.lng]);
				var legs = response.json.routes[0].legs

			  	for (var i=0; i<legs.length; i++){
			  		var steps = legs[i].steps;
					distance += legs[i].distance.value;
					duration += legs[i].duration.value;	  			

					for (var j=0; j<steps.length; j++){
			    	    path.push([steps[j].end_location.lat, steps[j].end_location.lng]);
			    	}
				}

				Route.update({ _id: this._id }, { $set: { status: 'success', "err_msg": "success", path:path, "total_distance": distance, "total_time": duration}}, function(){;});
			}
			else
			{

				var errorMsg = response.json.status;
				if("error_message" in response)
					errorMsg += " " + response.json.error_message;

				Route.update({ _id: this._id }, { $set: { status: 'failure', "err_msg": errorMsg}}, function(){;});

				//To update: why I cant throw error / promise reject here?
			}
		});
		
	}).catch(function(err){
		if("_id" in this)
			Route.update({ _id: this._id }, { $set: { status: 'failure', "err_msg": err}}, function(){;});
		else
			console.log ("Database Error: Problem with adding a new record to DB Error Details :" + err);
	});
};


// Find the route with a token
exports.getRoute = (req, res) => {

	//console.log(req.params.token);

    Route.findById(req.params.token)
    .then(route => {
        if(!route) {
            return res.status(400).send({
                message: "Token not found, really?"
            });            
        }

		var respObj = {};
		if(route.status  == "in progress"){
			respObj.status = route.status;

		}else if(route.status  == "failure"){
			respObj.status = route.status;
			respObj.error = route.err_msg;

		}else if(route.status  == "success"){
			respObj.status = route.status;
			respObj.path = route.path;
			respObj.total_distance = route.total_distance;
			respObj.total_time = route.total_time;
		}

		res.send(respObj);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(400).send({
                message: "Token not found, really?"
            });                
        }
        return res.status(500).send({
            message: "Error retrieving token, maybe try again?"
        });
    });
};