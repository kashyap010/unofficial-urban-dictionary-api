const axios = require("axios");
const cheerio = require("cheerio");

function extractDetails($, el) {
	return {
		word: $(el).find(".word").prop("innerText"),
		meaning: $(el).find(".meaning").prop("innerText"),
		example: $(el).find(".example").prop("innerText"),
		contributor: $(el).find(".contributor a").prop("innerText"),
		date: $(el).find(".contributor").contents()[2].data.trim(),
	};
}

async function scraper(
	path,
	{ term = undefined, strict, limit, matchCase } = {}
) {
	try {
		// optimise it, avoid extra calls
		const fixedUrl =
			`https://www.urbandictionary.com/${path}` + (term ? `?term=${term}` : "");
		const { data: html } = await axios.get(fixedUrl, { validateStatus: false });
		const $ = cheerio.load(html);

		if (!$(".definition").length) return [];

		const totalPages =
			$(".pagination").children().first().children().length || 1;

		const defns = [];
		for (let i = 1; i <= totalPages; i++) {
			const url = fixedUrl + (i > 1 ? `&page=${i}` : "");
			const { data: html } = await axios.get(url);

			const $ = cheerio.load(html);

			const $definitions = $(".definition");
			$definitions.each((idx, el) => {
				const word = $(el).find(".word").prop("innerText");
				if (JSON.parse(strict) && word.toLowerCase() != term.toLowerCase())
					return;
				else if (JSON.parse(matchCase) && word != term) return;

				const defn = extractDetails($, el);
				// console.log(defn);
				defns.push(defn);

				if (limit !== "none" && defns.length === parseInt(limit)) return false;
			});
		}
		return defns.length ? defns : [];
	} catch (e) {
		console.log("Scraping error", e);
		return e;
	}
}

module.exports = scraper;

// scraper("oolala");
