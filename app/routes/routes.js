module.exports = (app) => {
	const routeController = require('../controllers/controller.js');

	// Submit start point and waypoints
	app.post('/api/v1/route', routeController.submitRoute);

	// Find the route with a token
	app.get('/api/v1/route/:token', routeController.getRoute);
}
