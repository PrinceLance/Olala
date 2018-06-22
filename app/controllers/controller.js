const Route = require('../models/queryModel.js');
const Path = require('../models/pathModel.js');

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
		originPath : req.body
	});	
	
	// save the in progess
	newRoute.save()
	.then(function(data){
		var respObj = {};
		respObj.token = data._id;
		res.send(respObj);
		
		this._id = data._id;
		var waypoints = data.originPath;

		// init gmap client
		googleMapsClient = require('@google/maps').createClient({
			key: require('../../app/configs/googleAPIkey.js').key,   // HEYYY dont copy, gonna disable this soon
			Promise: Promise
		});		
			
		for(var x = 0; x< waypoints.length-1; x++){

			// iterate the waypoints (except starting point) and set each of them as destination

			// deep copy
			var tempWayP = JSON.parse(JSON.stringify(waypoints));
			
			// the destination
			var destina = waypoints[waypoints.length-1-x];

			//remove the "destination"
			tempWayP.splice(waypoints.length-1-x, 1);

			// remove the "starting point"
			tempWayP.splice(0, 1);

			// by this line tempWayP is basically the original waypoints minus the starting point and destination
			// params to pass to google directions api
			var googleAPIParams = {
				mode:"driving",
				optimize:true,
				origin:waypoints[0],
				destination:destina,
				waypoints:tempWayP 
			};

			// call gmap API
			googleMapsClient.directions(googleAPIParams)
			.asPromise()
			.then((response) => {

				if(response.json.status == "OK")
				{
					var path = [];
					var distance = 0;
					var duration = 0;

					// get the waypoint_order
					var order = response.json.routes[0].waypoint_order;
					var waypoints = response.query.waypoints.split("|"); // get the waypoints and split them, note that key 0 is not a wp

					// get the driving order for this route (which is the shortest for this route)
					path.push(response.query.origin.split(",")); // start
					for (var i=0; i<order.length; i++){
						path.push(waypoints[order[i]+1].split(",")); // whatever
					}
					path.push(response.query.destination.split(",")); // destination

					// calculate distance and duration of this route
					var legs = response.json.routes[0].legs
				  	for (var i=0; i<legs.length; i++){
						distance += legs[i].distance.value;
						duration += legs[i].duration.value;	  			
					}

					// insert into path
					Path.create({
						token:  this._id,
						status: 'success',
						path:path,
						total_distance: distance,
						total_time: duration,
						err_msg: "success"
					});
				}
				else
				{

					var errorMsg = response.json.status;
					if("error_message" in response)
						errorMsg += " " + response.json.error_message;

					// still... insert into path even when there's error
					Path.create({
						token:  this._id,
						status: 'failure',
						err_msg: errorMsg
					});
				}
			});
		}
		
	}).catch(function(err){
		if("_id" in this){
			Route.findById(this._id, function (error, doc){
				if(error)
					console.log ("Database Error: Problem Finding Record in DB to write failure message :" + error);
				else if(doc.status != 'success') // update only when current record is not successful
					Path.create({token:  this._id, status: 'failure', err_msg: err});
			});
		}
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

		Path.find({ token: route.id})
		.then(paths =>{
			
			var respObj = {}; // init response obj
			//console.log(paths);

			// first, we get the number of possible paths (original path length -1)
			var noOfPath = route.originPath.length-1;

			// if the number of paths in the DB is lower than the number of possible path
			// then we can see that some of the google api calls haven't been finished
			if(paths.length < noOfPath)
				respObj.status = "in progress";
			else{

				var status = "failure"; // hehehe
				var path = []; // hehehe
				var total_distance = 0; // hehehe
				var total_time = 0; // hehehe
				var error = ""; // hehehe

				// iterate the paths data to find out which one is the best
				for(var i = 0; i < noOfPath; i++)
				{
					// add error message for each path which failed
					if(paths[i].status == "failure")
						error += " " + paths[i].err_msg
					else{
						// overwrite when the status is failure (no success path yet)
						// or when the distance of current path is better
						if((status == "failure") || paths[i].total_distance < total_distance)
						{
							status = paths[i].status;
							path = paths[i].path;
							total_distance = paths[i].total_distance;
							total_time = paths[i].total_time;						
						}
					}
				}

				// when no path result in success
				if(status == "failure") {
					respObj.status = status;
					respObj.error = error;
				}
				else{  // when at least one path is successful
					respObj.status = status;
					respObj.path = path;
					respObj.total_distance = total_distance;
					respObj.total_time = total_time;
				}

			}
			res.send(respObj); // send result
		});

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