const axios = require("axios");
const cheerio = require("cheerio");
const { getPreviousDate } = require("../utils/dateUtils");

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
	{
		term,
		author,
		date,
		strict,
		limit,
		matchCase,
		character,
		scrapeType = "search",
		page,
		multiPage,
	} = {}
) {
	try {
		const baseUrl = "https://www.urbandictionary.com/";
		let fixedUrl = `${baseUrl}/${path}`;
		if (scrapeType === "search") fixedUrl += term ? `?term=${term}` : "";
		else if (scrapeType === "browse")
			fixedUrl += /^\d{4}-\d{2}-\d{2}$/.test(character)
				? `?date=${character}`
				: `?character=${character}`;
		else if (scrapeType === "author") fixedUrl += `?author=${author}`;
		else if (scrapeType === "date") fixedUrl += `?date=${date}`;

		let { data: html } = await axios.get(fixedUrl, { validateStatus: false });
		let $ = cheerio.load(html);

		if (scrapeType === "search" && !$(".definition").length)
			return { term, data: [] };
		if (scrapeType === "author" && !$(".definition").length)
			return { author, data: [] };

		if (scrapeType === "search" && path != "random.php") {
			const firstWord = $(".definition")
				.first()
				.find(".word")
				.prop("innerText");
			if (firstWord !== term && JSON.parse(matchCase)) return [];
			else if (firstWord !== term) term = firstWord;
		}

		let currentPage, maxPage;
		if (page !== "false") {
			[currentPage, maxPage] =
				multiPage === "false"
					? [page, page].map((i) => parseInt(i))
					: multiPage.split("-").map((i) => parseInt(i)); // single page : override
		} else {
			[currentPage, maxPage] =
				multiPage === "false"
					? [1, 5]
					: multiPage.split("-").map((i) => parseInt(i)); // default 5 pages : user entered pages
		}

		const $last = $("div[aria-label='Pagination'] a[aria-label='Last page']");
		const totalPages = $last.attr("href")
			? $last.attr("href").match(/page=(\d+)/)[1]
			: 1;

		const results = [];
		let breakLoop = false;
		let dateChanged = false;
		while (currentPage <= maxPage) {
			if (currentPage > 1 || dateChanged) {
				let url = `${baseUrl}/${path}`;
				if (scrapeType === "search") url += term ? `?term=${term}` : "";
				else if (scrapeType === "browse")
					url += /^\d{4}-\d{2}-\d{2}$/.test(character)
						? `?date=${character}`
						: `?character=${character}`;
				else if (scrapeType === "author") url += `?author=${author}`;
				else if (scrapeType === "date") url += `?date=${date}`;
				url += `&page=${currentPage}`;

				({ data: html } = await axios.get(url, { validateStatus: false }));
				$ = cheerio.load(html);
			}

			if (scrapeType === "search" || scrapeType === "author") {
				const $definitions = $(".definition");
				$definitions.each((idx, el) => {
					const word = $(el).find(".word").prop("innerText");
					if (
						scrapeType === "author" &&
						JSON.parse(strict) &&
						word.toLowerCase() != term.toLowerCase()
					)
						return;
					else if (
						scrapeType === "author" &&
						JSON.parse(matchCase) &&
						word != term
					)
						return;

					const defn = extractDetails($, el);
					results.push(defn);

					if (
						(limit !== "none" && results.length === parseInt(limit)) ||
						!$definitions.length
					) {
						breakLoop = true;
						return false;
					}
				});
			} else if (scrapeType === "browse" || scrapeType === "date") {
				const $ul = $("main").find("ul").first().children("li");
				if (
					scrapeType !== "date" &&
					/^\d{4}-\d{2}-\d{2}$/.test(character) &&
					!results.length &&
					!$ul.length
				) {
					character = getPreviousDate(character);
					dateChanged = true;
					continue;
				}

				$ul.each((idx, li) => {
					const word = $(li).find("a").text();
					results.push(word);

					if (
						(limit !== "none" && results.length === parseInt(limit)) ||
						!$ul.length
					) {
						breakLoop = true;
						return false;
					}
				});
			}
			if (breakLoop) break;

			dateChanged = false;
			currentPage++;
		}

		let response = {};

		if (scrapeType === "search" && term) response["term"] = term;
		else if (scrapeType === "browse")
			response["character"] = /^\d{4}-\d{2}-\d{2}$/.test(character)
				? "new"
				: character;
		else if (scrapeType === "author") response["author"] = author;
		else if (scrapeType === "date") response["date"] = date;

		response = {
			...response,
			found: results.length ? true : false,
			params: {
				strict,
				limit,
				matchCase,
				character,
				scrapeType,
				page,
				multiPage,
			},
			totalPages,
			data: results,
		};
		return response;
	} catch (e) {
		console.log("Scraping error\n", e);
		return e;
	}
}

module.exports = scraper;
