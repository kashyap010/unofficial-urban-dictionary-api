const {
	searchController,
	randomController,
	browseController,
	authorController,
} = require("../controllers");
const errorHandler = require("../controllers/errorHandler");

function setupRoutes(app) {
	app.get("/", (req, res) => {
		res.status(200).json({
			statusCode: 200,
			message: "Welcome to the Unofficial Urban Dictionary API",
			visitThisUrlForDocs: "https://unofficialurbandictionaryapi.com",
		});
	});

	app.get("/search", searchController);

	app.get("/random", randomController);

	app.get("/browse", browseController);

	app.get("/author", authorController);

	app.use(errorHandler);
}

module.exports = setupRoutes;
