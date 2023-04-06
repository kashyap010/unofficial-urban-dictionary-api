const scraper = require("../utils/scraper");
const validateQueryParams = require("../utils/validateQueryParams");

async function defineController(req, res, next) {
	const { word } = req.params;
	const { strict = false, limit = "none" } = req.query;

	const validationResult = validateQueryParams({ strict, limit, page });
	if (!validationResult.valid) {
		return res.status(400).json({
			error: validationResult.message,
		});
	}

	const meanings = await scraper(word, { strict, limit });
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
