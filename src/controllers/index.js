const scraper = require("../utils/scraper");
const { getYesterdayDate } = require("../utils/dateUtils");
const validateQueryParams = require("../utils/validateQueryParams");

async function searchController(req, res, next) {
	const {
		term,
		strict = "false",
		limit = "none",
		matchCase = "false",
		page = "1",
		multiPage = "false",
	} = req.query;

	if (!term)
		return res.status(400).json({
			error: "Bad request",
			message: "Term query parameter is required",
		});

	const validationResult = validateQueryParams({
		term,
		strict,
		limit,
		matchCase,
		page,
		multiPage,
	});
	if (!validationResult.valid)
		return res.status(400).json({
			error: "Bad request",
			message: validationResult.message,
		});

	const response = await scraper("define.php", {
		term,
		strict,
		limit,
		matchCase,
		page,
		multiPage,
	});
	if (response.data && !response.data.length)
		return res.status(404).json({
			statusCode: 404,
			...response,
			message: "No definitions found for this word",
		});
	res.status(200).json({
		statusCode: 200,
		...response,
	});
}

async function randomController(req, res) {
	const {
		strict = "false",
		limit = "none",
		matchCase = "false",
		page = "1",
		multiPage = "false",
	} = req.query;

	const validationResult = validateQueryParams({
		strict,
		limit,
		matchCase,
		page,
		multiPage,
	});
	if (!validationResult.valid)
		return res.status(400).json({
			error: "Bad request",
			message: validationResult.message,
		});

	const response = await scraper("random.php", {
		strict,
		limit,
		matchCase,
		page,
		multiPage,
	});
	if (response.data && !response.data.length)
		return res.status(404).json({
			statusCode: 404,
			...response,
			message: "No definitions found for this word",
		});
	res.status(200).json({
		statusCode: 200,
		...response,
	});
}

async function browseController(req, res) {
	let character = req.query.character;
	const {
		strict = "false",
		limit = "none",
		matchCase = "false",
		page = "1",
		multiPage = "false",
	} = req.query;

	if (!character)
		return res.status(400).json({
			error: "Bad request",
			message: "Character query parameter is required",
		});

	const validationResult = validateQueryParams({
		character,
		strict,
		limit,
		matchCase,
		page,
		multiPage,
	});
	if (!validationResult.valid)
		return res.status(400).json({
			error: "Bad request",
			message: validationResult.message,
		});

	const scrapeType = "browse";
	const path = character === "new" ? "yesterday.php" : "browse.php";
	character = character === "new" ? getYesterdayDate() : character;

	const response = await scraper(path, {
		character,
		strict,
		limit,
		matchCase,
		scrapeType,
		page,
		multiPage,
	});
	if (response.data && !response.data.length)
		return res.status(404).json({
			statusCode: 404,
			...response,
			message: "No words found for this character",
		});
	res.status(200).json({
		statusCode: 200,
		...response,
	});
}

module.exports = { searchController, randomController, browseController };
