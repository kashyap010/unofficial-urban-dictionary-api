const path = require("path");

const {
	searchController,
	randomController,
	browseController,
	authorController,
	dateController,
} = require("../controllers");
const errorHandler = require("../controllers/errorHandler");

function setupRoutes(app) {
	app.get("/api", (req, res) => {
		res.status(200).json({
			statusCode: 200,
			message: "Welcome to the Unofficial Urban Dictionary API",
			visitThisUrlForDocs: "https://unofficialurbandictionaryapi.com",
		});
	});

	app.get("/", (req, res) => {
		res.sendFile(path.join(__dirname, "./views/main.html"));
	});

	app.get("/api/search", searchController);

	app.get("/api/random", randomController);

	app.get("/api/browse", browseController);

	app.get("/api/author", authorController);

	app.get("/api/date", dateController);

	app.use(errorHandler);
}

module.exports = setupRoutes;
