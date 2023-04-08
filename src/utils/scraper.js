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
	{ term, strict, limit, matchCase, character, scrapeType = "search" } = {}
) {
	try {
		const baseUrl = "https://www.urbandictionary.com/";
		let fixedUrl;
		if (scrapeType === "search")
			fixedUrl = `${baseUrl}/${path}` + (term ? `?term=${term}` : "");
		else if (scrapeType === "browse")
			fixedUrl = `${baseUrl}/${path}?character=${character}`;

		let { data: html } = await axios.get(fixedUrl, { validateStatus: false });
		let $ = cheerio.load(html);

		if (scrapeType === "search" && !$(".definition").length) return [];

		if (scrapeType === "search") {
			const firstWord = $(".definition")
				.first()
				.find(".word")
				.prop("innerText");
			if (firstWord !== term && JSON.parse(matchCase)) return [];
			else if (firstWord !== term) term = firstWord;
		}

		const maxPages = $(".pagination").children().first().children().length || 1;

		const defns = [];
		const words = [];
		let breakLoop = false;
		for (let i = 1; i <= maxPages; i++) {
			if (i > 1) {
				const url =
					`${baseUrl}/${path}` + (term ? `?term=${term}` : "") + `&page=${2}`;
				({ data: html } = await axios.get(url));
				$ = cheerio.load(html);
			}

			if (scrapeType === "search") {
				const $definitions = $(".definition");
				$definitions.each((idx, el) => {
					const word = $(el).find(".word").prop("innerText");
					if (JSON.parse(strict) && word.toLowerCase() != term.toLowerCase())
						return;
					else if (JSON.parse(matchCase) && word != term) return;

					const defn = extractDetails($, el);
					defns.push(defn);

					if (limit !== "none" && defns.length === parseInt(limit)) {
						breakLoop = true;
						return false;
					}
				});
			} else if (scrapeType === "browse") {
				const $ul = $("main").find("ul").first().children("li");
				$ul.each((idx, li) => {
					const word = $(li).find("a").text();
					words.push(word);

					if (limit !== "none" && words.length === parseInt(limit)) {
						breakLoop = true;
						return false;
					}
				});
			}
			if (breakLoop) break;
		}
		if (scrapeType === "search") return defns.length ? defns : [];
		return words.length ? words : [];
	} catch (e) {
		console.log("Scraping error", e);
		return e;
	}
}

module.exports = scraper;
