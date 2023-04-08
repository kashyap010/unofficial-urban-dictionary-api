const {
	searchController,
	randomController,
	browseController,
} = require("../controllers");

function setupRoutes(app) {
	app.get("/", (req, res) => {
		res.status(200).json({
			status: 200,
			msg: "Welcome to the Unofficial Urban Dictionary API",
			visitThisUrlForDocs: "https://unofficialurbandictionaryapi.com",
		});
	});

	app.get("/search", searchController);

	app.get("/random", randomController);

	app.get("/browse", browseController);
}

module.exports = setupRoutes;
