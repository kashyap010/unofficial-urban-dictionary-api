const scraper = require("../utils/scraper");
const getYesterdayDate = require("../utils/getYesterdayDate");
const validateQueryParams = require("../utils/validateQueryParams");

async function searchController(req, res, next) {
	const {
		term,
		strict = "false",
		limit = "none",
		matchCase = "false",
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
	});
	if (!validationResult.valid)
		return res.status(400).json({
			error: "Bad request",
			message: validationResult.message,
		});

	const meanings = await scraper("define.php", {
		term,
		strict,
		limit,
		matchCase,
	});
	if (!meanings.length)
		return res.status(404).json({
			term: term,
			found: false,
			message: "No definitions found for this word",
		});
	res.status(200).json({
		term: term,
		found: true,
		definitions: meanings,
	});
}

async function randomController(req, res) {
	const { strict = "false", limit = "none", matchCase = "false" } = req.query;

	const validationResult = validateQueryParams({
		strict,
		limit,
		matchCase,
	});
	if (!validationResult.valid)
		return res.status(400).json({
			error: "Bad request",
			message: validationResult.message,
		});

	const meanings = await scraper("random.php", {
		strict,
		limit,
		matchCase,
	});
	if (!meanings.length)
		return res.status(404).json({
			message: "No definitions found for this word",
		});
	res.status(200).json({
		found: true,
		definitions: meanings,
	});
}

async function browseController(req, res) {
	let character = req.query.character;
	const { strict = "false", limit = "none", matchCase = "false" } = req.query;

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
	});
	if (!validationResult.valid)
		return res.status(400).json({
			error: "Bad request",
			message: validationResult.message,
		});

	const scrapeType = "browse";
	const path = character === "new" ? "yesterday.php" : "browse.php";
	character = character === "new" ? getYesterdayDate() : character;

	const meanings = await scraper(path, {
		character,
		strict,
		limit,
		matchCase,
		scrapeType,
	});
	if (!meanings.length)
		return res.status(404).json({
			found: false,
			character: character,
			message: "No words found for this character",
		});
	res.status(200).json({
		found: true,
		character: character,
		definitions: meanings,
	});
}

module.exports = { searchController, randomController, browseController };
