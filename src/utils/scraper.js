const axios = require("axios");
const cheerio = require("cheerio");
// const pretty = require("pretty");

function minMax(value) {
	const max = 2; // adjust depending on how many pages you want to scrape data from
	return Math.min(Math.max(value, 1), max);
}

function extractDetails($, el) {
	return {
		word: $(el).find(".word").prop("innerText"),
		meaning: $(el).find(".meaning").prop("innerText"),
		example: $(el).find(".example").prop("innerText"),
		contributor: $(el).find(".contributor a").prop("innerText"),
		date: $(el).find(".contributor").contents()[2].data.trim(),
	};
}

async function scraper(term, { strict, limit, matchCase }) {
	try {
		const baseUrl = `https://www.urbandictionary.com/define.php?term=${term}`;
		const { data: html } = await axios.get(baseUrl, { validateStatus: false });
		const $ = cheerio.load(html);

		if (!$(".definition").length) return [];

		const totalPages =
			$(".pagination").children().first().children().length || 1;

		const defns = [];
		for (let i = 1; i <= totalPages; i++) {
			const url = baseUrl + (i > 1 ? `&page=${i}` : "");
			const { data: html } = await axios.get(url);

			const $ = cheerio.load(html);

			const $definitions = $(".definition");
			$definitions.each((idx, el) => {
				const word = $(el).find(".word").prop("innerText");
				if (JSON.parse(strict) && word.toLowerCase() != term.toLowerCase())
					return;
				else if (JSON.parse(matchCase) && word != term) return;

				const defn = extractDetails($, el);
				console.log(defn);
				defns.push(defn);
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
