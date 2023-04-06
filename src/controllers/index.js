const scraper = require("../utils/scraper");
const validateQueryParams = require("../utils/validateQueryParams");

async function defineController(req, res, next) {
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

	const meanings = await scraper(term, { strict, limit, matchCase });
	if (!meanings.length)
		return res.status(404).json({
			word: word,
			found: false,
			message: "No definitions found for this word",
		});
	res.status(200).json({
		word: req.params.word,
		found: true,
		definitions: meanings,
	});
}

module.exports = { defineController };
