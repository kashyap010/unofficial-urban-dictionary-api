const { defineController } = require("../controllers");

function setupRoutes(app) {
	// Root endpoint
	app.get("/", (req, res) => {
		res.status(200).json({
			status: 200,
			msg: "Welcome to the Unofficial Urban Dictionary API",
			visitThisUrlForDocs: "https://unofficialurbandictionaryapi.com",
		});
	});

	app.get("/define", defineController);

	// app.get('/random', defineController);

	// app.get('/browse/:category', defineController);

	// app.get('/search', defineController);
}

module.exports = setupRoutes;
