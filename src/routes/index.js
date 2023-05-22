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
	// app.get("/", (req, res) => {
	// 	res.status(200).json({
	// 		statusCode: 200,
	// 		message: "Welcome to the Unofficial Urban Dictionary API",
	// 		visitThisUrlForDocs: "https://unofficialurbandictionaryapi.com",
	// 	});
	// });
	app.get("/", (req, res) => {
		res.sendFile(path.join(__dirname, "../../views/main.html"));
	});

	app.get("/search", searchController);

	app.get("/random", randomController);

	app.get("/browse", browseController);

	app.get("/author", authorController);

	app.get("/date", dateController);

	app.use(errorHandler);
}

module.exports = setupRoutes;
